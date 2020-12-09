// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicModel", function (require) {
    "use strict";

    var BasicModel = require("web.BasicModel");

    BasicModel.include({

        /**
         * @param {Number/String} handle
         * @param {Object} context
         */
        updateRecordContext: function (handle, context) {
            this.localData[handle].context = _.extend(
                {},
                this.localData[handle].context,
                context);
        },

        /**
         * @param {Number/String} id
         * @returns {Boolean}
         */
        isPureVirtual: function (id) {
            var data = this.localData[id];
            return data._virtual || false;
        },

        /**
         * @param {Number/String} id
         * @param {Boolean} status
         */
        setPureVirtual: function (id, status) {
            var data = this.localData[id];
            if (status) {
                data._virtual = true;
            } else {
                delete data._virtual;
            }
        },

        /**
         * @param {Number/String} id
         */
        unsetDirty: function (id) {
            var data = this.localData[id];
            data._isDirty = false;
            this._visitChildren(data, function (r) {
                r._isDirty = false;
            });
        },

        /**
         * Generates a virtual records without link it
         *
         * @param {Integer/String} listID
         * @param {Object} options
         * @returns {Deferred}
         */
        createVirtualRecord: function (listID, options) {
            var self = this;
            var list = this.localData[listID];
            var context = _.extend({}, this._getContext(list), options.context);

            var position = options?options.position:'top';
            var params = {
                context: context,
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                viewType: list.viewType,
                allowWarning: true,
                doNotSetDirty: true,
            };

            return $.Deferred(function (d) {
                self._makeDefaultRecord(list.model, params)
                    .then(function (recordID) {
                        self.setPureVirtual(recordID, true);
                        if (options.data) {
                            self._applyChangeNoWarnings(
                                recordID,
                                options.data,
                                params
                            ).then(function () {
                                d.resolve(self.get(recordID));
                            });
                        } else {
                            d.resolve(self.get(recordID));
                        }
                    });
            });
        },

        /**
         * Cloned '_applyChange' but without warning messages
         *
         * @private
         * @param {Number} recordID
         * @param {Object} changes
         * @param {Object} options
         * @returns {Deferred}
         */
        _applyChangeNoWarnings: function (recordID, changes, options) {
            var self = this;
            var record = this.localData[recordID];
            var field;
            var defs = [];
            options = options || {};
            record._changes = record._changes || {};
            if (!options.doNotSetDirty) {
                record._isDirty = true;
            }
            var initialData = {};
            this._visitChildren(record, function (elem) {
                initialData[elem.id] = $.extend(true, {}, _.pick(elem, 'data', '_changes'));
            });

            // Apply changes to local data
            for (var fieldName in changes) {
                field = record.fields[fieldName];
                if (field && (field.type === 'one2many' || field.type === 'many2many')) {
                    defs.push(this._applyX2ManyChange(
                        record,
                        fieldName,
                        changes[fieldName],
                        options.viewType,
                        options.allowWarning));
                } else if (field && (field.type === 'many2one' || field.type === 'reference')) {
                    defs.push(this._applyX2OneChange(record, fieldName, changes[fieldName]));
                } else {
                    record._changes[fieldName] = changes[fieldName];
                }
            }

            if (options.notifyChange === false) {
                return $.Deferred().resolve(_.keys(changes));
            }

            return $.when.apply($, defs).then(function () {

                // The fields that have changed and that have an on_change
                var onChangeFields = [];
                for (var fieldName in changes) {
                    field = record.fields[fieldName];
                    if (field && field.onChange) {
                        var isX2Many = (
                            field.type === 'one2many' ||
                            field.type === 'many2many'
                        );
                        if (
                            !isX2Many ||
                            (
                                self._isX2ManyValid(
                                    record._changes[fieldName] ||
                                    record.data[fieldName]
                                )
                            )
                        ) {
                            onChangeFields.push(fieldName);
                        }
                    }
                }
                var onchangeDef = $.Deferred();
                if (onChangeFields.length) {
                    self._performOnChangeNoWarnings(record, onChangeFields, options.viewType)
                        .then(function (result) {
                            delete record._warning;
                            onchangeDef.resolve(
                                _.keys(changes).concat(
                                    Object.keys((result && result.value) || {})));
                        }).fail(function () {
                            self._visitChildren(record, function (elem) {
                                _.extend(elem, initialData[elem.id]);
                            });

                            // Safe fix for stable version, for opw-2267444
                            if (!options.force_fail) {
                                onchangeDef.resolve({});
                            } else {
                                onchangeDef.reject({});
                            }
                        });
                } else {
                    onchangeDef = $.Deferred().resolve(_.keys(changes));
                }
                return onchangeDef.then(function (fieldNames) {
                    _.each(fieldNames, function (name) {
                        if (
                            record._changes &&
                            record._changes[name] === record.data[name]
                        ) {
                            delete record._changes[name];
                            record._isDirty = !_.isEmpty(record._changes);
                        }
                    });
                    return self._fetchSpecialData(record).then(function (fieldNames2) {

                        // Return the names of the fields that changed (onchange or
                        // associated special data change)
                        return _.union(fieldNames, fieldNames2);
                    });
                });
            });
        },

        /**
         * Cloned '_performOnChange' but without warning messages
         *
         * @private
         * @param {Object} record
         * @param {Object} fields
         * @param {String} viewType
         * @returns {Deferred}
         */
        _performOnChangeNoWarnings: function (record, fields, viewType) {
            var self = this;
            var onchangeSpec = this._buildOnchangeSpecs(record, viewType);
            if (!onchangeSpec) {
                return $.when();
            }
            var idList = record.data.id ? [record.data.id] : [];
            var options = {
                full: true,
            };
            if (fields.length === 1) {
                fields = fields[0];

                // If only one field changed, add its context to the RPC context
                options.fieldName = fields;
            }
            var context = this._getContext(record, options);
            var currentData = this._generateOnChangeData(record, {changesOnly: false});

            return self._rpc({
                model: record.model,
                method: 'onchange',
                args: [idList, currentData, fields, onchangeSpec, context],
            }).then(function (result) {
                if (!record._changes) {

                    // If the _changes key does not exist anymore, it means that
                    // it was removed by discarding the changes after the rpc
                    // to onchange. So, in that case, the proper response is to
                    // ignore the onchange.
                    return;
                }
                if (result.domain) {
                    record._domains = _.extend(record._domains, result.domain);
                }
                return self._applyOnChange(result.value, record).then(function () {
                    return result;
                });
            });
        },
    });

});
