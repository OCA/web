// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicModel", function(require) {
    "use strict";

    var BasicModel = require("web.BasicModel");
    var FieldOne2ManyProductPicker = require("web_widget_one2many_product_picker.FieldOne2ManyProductPicker");

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
        isSaving: function(id) {
            var data = this.localData[id];
            return data._virtual || false;
        },

        /**
         * @param {String} id
         * @returns {Boolean}
         */
        isPureVirtual: function(id) {
            var data = this.localData[id];
            return data._virtual || false;
        },

        /**
         * @param {String} id
         * @param {Boolean} status
         */
        setPureVirtual: function(id, status) {
            var data = this.localData[id];
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
            var data = this.localData[id];
            data._isDirty = false;
            this._visitChildren(data, function(r) {
                r._isDirty = false;
            });
        },

        /**
         * 'Pure virtual' records are not used by other
         * elements so can be removed safesly
         *
         * @param {String} id
         * @returns {Boolean}
         */
        removeVirtualRecord: function(id) {
            if (!this.isPureVirtual(id)) {
                return false;
            }

            var data = this.localData[id];
            var to_remove = [];
            this._visitChildren(data, function(item) {
                to_remove.push(item.id);
            });

            to_remove.reverse();
            for (var remove_id of to_remove) {
                this.removeLine(remove_id);
                delete this.localData[remove_id];
            }
            return true;
        },

        /**
         * This is a cloned method from Odoo framework.
         * Virtual records are processed in two parts,
         * this is the second part and here we trigger onchange
         * process.
         *
         * @param {Object} record
         * @param {Object} params
         * @returns {Deferred}
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

            return this._rpc(
                {
                    model: record.model,
                    method: "default_get",
                    args: [fields_key],
                    context: params.context,
                },
                {
                    shadow: true,
                }
            ).then(function(result) {
                // Interrupt point (used in instant search)
                if (!self.exists(record.id)) {
                    return $.Deferred().reject();
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
                            return $.Deferred().reject();
                        }
                        var def = $.Deferred();
                        // Interrupt point (used in instant search)
                        if (!self.exists(record.id)) {
                            return $.Deferred().reject();
                        }
                        var always = function() {
                            if (record._warning) {
                                if (params.allowWarning) {
                                    delete record._warning;
                                } else {
                                    def.reject();
                                }
                            }
                            def.resolve();
                        };
                        self._performOnChange(record, fields_key)
                            .then(always)
                            .always(always);
                        return def;
                    })
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return $.Deferred().reject();
                        }
                        return self._fetchRelationalData(record);
                    })
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return $.Deferred().reject();
                        }
                        return self._postprocess(record);
                    })
                    .then(function() {
                        if (!self.exists(record.id)) {
                            return $.Deferred().reject();
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
            var list = this.localData[listID];
            var context = _.extend({}, this._getContext(list), options.context);

            var position = options ? options.position : "top";
            var params = {
                context: context,
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                viewType: list.viewType,
                allowWarning: true,
                doNotSetDirty: true,
                postonchange_values: options.onchange_values,
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

            var record = this._makeDataPoint({
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
                not_onchange: true, // To know is the record has the initial onchange applied
                shadow: true, // To avoid show the loading backdrop
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
            var self = this;
            var list = this.localData[listID];
            var context = _.extend(
                {shadow: true},
                this._getContext(list),
                options.context
            );

            var position = options ? options.position : "top";
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

            return this._makeDefaultRecord(list.model, params).then(function(recordID) {
                self.setPureVirtual(recordID, true);
                self.updateRecordContext(recordID, {
                    ignore_warning: true,
                    not_onchange: true,
                    shadow: true,
                });
                return {
                    record: self.get(recordID),
                    params: params,
                };
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
            if (record && record.context) {
                record.context.not_onchange = false;
                var this_mp = _.clone(this);
                if (record.context.shadow) {
                    // Force use 'shadow'
                    var super__rpc_call = this._rpc;
                    this_mp._rpc = function(params, options) {
                        options = options || {};
                        options.shadow = true;
                        return super__rpc_call.call(this, params, options);
                    }.bind(this);
                }
                if (record.context.ignore_warning) {
                    var super_trigger_up_call = this.trigger_up;
                    // Avoid show warnings
                    this_mp.trigger_up = function(event_name, data) {
                        if (event_name === "warning" && data.type === "dialog") {
                            // Do nothing
                            return;
                        }
                        return super_trigger_up_call.apply(this, arguments);
                    }.bind(this);
                }
                return this._super.apply(this_mp, arguments);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Because records can be removed at any time we
         * need check if the record still existing.
         * Necessary for 'instant search' feature.
         *
         * @override
         */
        _applyOnChange: function(values, record) {
            if (!this.exists(record.id)) {
                return $.Deferred().reject();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Allow add multiple records at the same time
         *
         * @override
         */
        _applyX2ManyChange: function(record, fieldName, command) {
            if (command.operation === "ADD_MULTIPLE") {
                var self = this;
                var localID =
                    (record._changes && record._changes[fieldName]) ||
                    record.data[fieldName];
                var list = this.localData[localID];
                list._changes = list._changes || [];
                // For now, we are in the context of a one2many field
                // the command should look like this:
                // { operation: 'ADD', ids: [id0,id1,id2,...] }
                // The corresponding record may contain value for fields that
                // are unknown in the list (e.g. fields that are in the
                // subrecord form view but not in the kanban or list view), so
                // to ensure that onchanges are correctly handled, we extend the
                // list's fields with those in the created record
                _.each(command.ids, function(id) {
                    var newRecord = self.localData[id];
                    _.defaults(list.fields, newRecord.fields);
                    _.defaults(list.fieldsInfo, newRecord.fieldsInfo);
                    newRecord.fields = list.fields;
                    newRecord.fieldsInfo = list.fieldsInfo;
                    newRecord.viewType = list.viewType;
                    list._cache[newRecord.res_id] = newRecord.id;
                    list._changes.push(command);
                });
            }
            return this._super.apply(this, arguments);
        },

        /**
         * This is necessary to avoid calculate onchanges that
         * affects to order_line.
         *
         * @override
         */
        _buildOnchangeSpecs: function(record) {
            var specs = this._super.apply(this, arguments);
            // This is necessary to improve the performance
            if (record.model === "sale.order" && specs) {
                // Its a change from product picker?
                // WORKAROUND: Done in this way to reutilice odoo methods
                var need_clean = false;
                var parent_controller = this.getParent();
                if (
                    parent_controller &&
                    parent_controller.renderer &&
                    !_.isEmpty(parent_controller.renderer.allFieldWidgets)
                ) {
                    var order_line_widget = _.find(
                        parent_controller.renderer.allFieldWidgets[
                            parent_controller.handle
                        ],
                        {name: "order_line"}
                    );
                    need_clean =
                        order_line_widget instanceof FieldOne2ManyProductPicker &&
                        !_.isEmpty(this.localData[record.data.order_line]);
                }
                if (need_clean) {
                    var new_specs = _.clone(specs);
                    for (var key in specs) {
                        if (key.startsWith("order_line.")) {
                            delete new_specs[key];
                        }
                    }
                    return new_specs;
                }
            }
            return specs;
        },

        /**
         * @param {String} recordID
         * @returns {Boolean}
         */
        hasChanges: function(recordID) {
            var record = this.localData[recordID];
            return record && !_.isEmpty(record._changes);
        },

        /**
         * @param {Object} model_fields
         * @param {String} model
         * @param {String} search_val
         * @param {Array} domain
         * @param {Array} fields
         * @param {Object} orderby
         * @param {String} operator
         * @param {Number} limit
         * @param {Number} offset
         * @param {Object} context
         * @returns {Deferred}
         */
        fetchNameSearchFull: function(
            model_fields,
            model,
            search_val,
            domain,
            fields,
            orderby,
            operator,
            limit,
            offset,
            context
        ) {
            var self = this;
            return this._rpc({
                model: model,
                method: "name_search",
                kwargs: {
                    name: search_val,
                    args: domain || [],
                    operator: operator || "ilike",
                    limit: this.limit,
                    context: context || {},
                },
            }).then(function(results) {
                var record_ids = results.map(function(item) {
                    return item[0];
                });
                return self.fetchGenericRecords(
                    model_fields,
                    model,
                    [["id", "in", record_ids]],
                    fields,
                    orderby,
                    limit,
                    offset,
                    context
                );
            });
        },

        /**
         * @param {Object} model_fields
         * @param {String} model
         * @param {Array} domain
         * @param {Array} fields
         * @param {Array} orderby
         * @param {Number} limit
         * @param {Number} offset
         * @param {Object} context
         * @returns {Deferred}
         */
        fetchGenericRecords: function(
            model_fields,
            model,
            domain,
            fields,
            orderby,
            limit,
            offset,
            context
        ) {
            var self = this;
            return this._rpc({
                model: model,
                method: "search_read",
                fields: fields,
                domain: domain,
                limit: limit,
                offset: offset,
                orderBy: orderby,
                kwargs: {context: context},
            }).then(function(result) {
                for (var index in result) {
                    var record = result[index];
                    for (var fieldName in record) {
                        var field = model_fields[fieldName];
                        if (field.type !== "many2one") {
                            record[fieldName] = self._parseServerValue(
                                model_fields[fieldName],
                                record[fieldName]
                            );
                        }
                    }
                }
                return result;
            });
        },

        fetchModelFieldsInfo: function(model) {
            return this._rpc({
                model: model,
                method: "fields_get",
                args: [
                    false,
                    [
                        "store",
                        "searchable",
                        "type",
                        "string",
                        "relation",
                        "selection",
                        "related",
                    ],
                ],
                context: this.getSession().user_context,
            });
        },
    });
});
