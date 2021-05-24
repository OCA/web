// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicModel", function(require) {
    "use strict";

    const BasicModel = require("web.BasicModel");

    BasicModel.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
        },

        /**
         * This is necessary because 'pure virtual' records
         * can be destroyed at any time.
         *
         * @param {String} id
         * @returns {Boolean}
         */
        exists: function(id) {
            return !_.isEmpty(this.localData[id]);
        },

        /**
         * @param {String} id
         * @param {Object} context
         */
        updateRecordContext: function(id, context) {
            this.localData[id].context = _.extend(
                {},
                this.localData[id].context,
                context
            );
        },

        /**
         * @param {String} id
         * @returns {Boolean}
         */
        isPureVirtual: function(id) {
            const data = this.localData[id];
            return data._virtual || false;
        },

        /**
         * @param {String} id
         * @param {Boolean} status
         */
        setPureVirtual: function(id, status) {
            const data = this.localData[id];
            if (status) {
                data._virtual = true;
            } else {
                delete data._virtual;
            }
        },

        /**
         * @param {String} id
         */
        unsetDirty: function(id) {
            const data = this.localData[id];
            data._isDirty = false;
            this._visitChildren(data, r => {
                r._isDirty = false;
            });
        },

        /**
         * 'Pure virtual' records are not used by other
         * elements so can be removed safesly
         *
         * @param {String} id
         */
        removeVirtualRecord: function(id) {
            if (!this.isPureVirtual(id)) {
                return false;
            }

            const data = this.localData[id];
            const to_remove = [];
            this._visitChildren(data, item => {
                to_remove.push(item.id);
            });

            to_remove.reverse();
            for (const remove_id of to_remove) {
                this.removeLine(remove_id);
                delete this.localData[remove_id];
            }
        },

        /**
         * This is a cloned method from Odoo framework.
         * Virtual records are processed in two parts,
         * this is the second part and here we trigger onchange
         * process.
         *
         * @param {Object} record
         * @param {Object} params
         * @returns {Promise}
         */
        _makeDefaultRecordNoDatapoint: function(record, params) {
            var self = this;

            var targetView = params.viewType;
            var fieldsInfo = params.fieldsInfo;
            var fieldNames = Object.keys(fieldsInfo[targetView]);
            var fields_key = _.without(fieldNames, "__last_update");

            // Fields that are present in the originating view, that need to be initialized
            // Hence preventing their value to crash when getting back to the originating view
            var parentRecord =
                params.parentID && this.localData[params.parentID].type === "list"
                    ? this.localData[params.parentID]
                    : null;

            if (parentRecord && parentRecord.viewType in parentRecord.fieldsInfo) {
                var originView = parentRecord.viewType;
                fieldNames = _.union(
                    fieldNames,
                    Object.keys(parentRecord.fieldsInfo[originView])
                );
            }

            return this._rpc({
                model: record.model,
                method: "default_get",
                args: [fields_key],
                context: params.context,
            }).then(function(result) {
                // Interrupt point (used in instant search)
                if (!self.exists(record.id)) {
                    return Promise.reject();
                }

                // We want to overwrite the default value of the handle field (if any),
                // in order for new lines to be added at the correct position.
                // -> This is a rare case where the defaul_get from the server
                //    will be ignored by the view for a certain field (usually "sequence").

                var overrideDefaultFields = self._computeOverrideDefaultFields(
                    params.parentID,
                    params.position
                );

                if (overrideDefaultFields) {
                    result[overrideDefaultFields.field] = overrideDefaultFields.value;
                }

                return self
                    .applyDefaultValues(record.id, result, {fieldNames: fieldNames})
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return Promise.reject();
                        }
                        var def = new Promise(function(resolve, reject) {
                            var always = function() {
                                if (record._warning) {
                                    if (params.allowWarning) {
                                        delete record._warning;
                                    } else {
                                        reject();
                                    }
                                }
                                resolve();
                            };
                            self._performOnChange(record, fields_key)
                                .then(always)
                                .guardedCatch(always);
                        });
                        return def;
                    })
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return Promise.reject();
                        }
                        return self._fetchRelationalData(record);
                    })
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return Promise.reject();
                        }
                        return self._postprocess(record);
                    })
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return Promise.reject();
                        }
                        // Save initial changes, so they can be restored later,
                        // if we need to discard.
                        self.save(record.id, {savePoint: true});

                        return record.id;
                    });
            });
        },

        /**
         * Virtual records are processed in two parts,
         * this is the first part and here we create
         * the state (without aditional process)
         *
         * @param {String} listID
         * @param {Object} options
         * @returns {Object}
         */
        createVirtualDatapoint: function(listID, options) {
            const list = this.localData[listID];
            const context = _.extend({}, this._getContext(list), options.context);

            const position = options ? options.position : "top";
            const params = {
                context: context,
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                viewType: list.viewType,
                allowWarning: true,
                doNotSetDirty: true,
            };

            var targetView = params.viewType;
            var fields = params.fields;
            var fieldsInfo = params.fieldsInfo;

            // Fields that are present in the originating view, that need to be initialized
            // Hence preventing their value to crash when getting back to the originating view
            var parentRecord =
                params.parentID && this.localData[params.parentID].type === "list"
                    ? this.localData[params.parentID]
                    : null;

            if (parentRecord && parentRecord.viewType in parentRecord.fieldsInfo) {
                var originView = parentRecord.viewType;
                fieldsInfo[targetView] = _.defaults(
                    {},
                    fieldsInfo[targetView],
                    parentRecord.fieldsInfo[originView]
                );
                fields = _.defaults({}, fields, parentRecord.fields);
            }

            const record = this._makeDataPoint({
                modelName: list.model,
                fields: fields,
                fieldsInfo: fieldsInfo,
                context: params.context,
                parentID: params.parentID,
                res_ids: params.res_ids,
                viewType: targetView,
            });
            this.setPureVirtual(record.id, true);
            this.updateRecordContext(record.id, {
                ignore_warning: true,
                not_onchange: true,
            });

            return {
                record: record,
                params: params,
            };
        },

        /**
         * Generates a virtual records without hard-link to any model.
         *
         * @param {Integer/String} listID
         * @param {Object} options
         * @returns {Deferred}
         */
        createVirtualRecord: function(listID, options) {
            const list = this.localData[listID];
            const context = _.extend({}, this._getContext(list), options.context);

            const position = options ? options.position : "top";
            const params = {
                context: context,
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                viewType: list.viewType,
                allowWarning: true,
                doNotSetDirty: true,
            };

            return new Promise(resolve => {
                this._makeDefaultRecord(list.model, params).then(recordID => {
                    this.setPureVirtual(recordID, true);
                    this.updateRecordContext(recordID, {
                        ignore_warning: true,
                        not_onchange: true,
                    });
                    resolve({
                        record: this.get(recordID),
                        params: params,
                    });
                });
            });
        },

        /**
         * Adds support to avoid show onchange warnings.
         * The implementation is a pure hack that clone
         * the context and do a monkey patch to the
         * 'trigger_up' method.
         *
         * @override
         */
        _performOnChange: function(record) {
            if (record && record.context && record.context.ignore_warning) {
                const this_mp = _.clone(this);
                const super_call = this.trigger_up;
                this_mp.trigger_up = function(event_name, data) {
                    if (event_name === "warning" && data.type === "dialog") {
                        // Do nothing
                        return;
                    }
                    return super_call.apply(this, arguments);
                }.bind(this);
                return this._super.apply(this_mp, arguments);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * This happens when the user discard main document changes (isn't a rollback)
         *
         * @override
         */
        discardChanges: function(id, options) {
            this._super.apply(this, arguments);
            options = options || {};
            var isNew = this.isNew(id);
            var rollback = "rollback" in options ? options.rollback : isNew;
            if (rollback) {
                return;
            }
            const element = this.localData[id];
            this._visitChildren(element, function(elem) {
                if (
                    elem &&
                    elem.context &&
                    elem.context.product_picker_modified &&
                    _.isEmpty(elem._changes)
                ) {
                    elem.context.product_picker_modified = false;
                }
            });
        },
    });
});
