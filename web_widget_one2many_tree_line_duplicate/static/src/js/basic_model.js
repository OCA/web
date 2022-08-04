/* Copyright 2021 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_widget_one2many_tree_line_duplicate.BasicModel", function(require) {
    "use strict";

    const BasicModel = require("web.BasicModel");
    const rpc = require("web.rpc");

    function dateToServer(date) {
        return date
            .clone()
            .utc()
            .locale("en")
            .format("YYYY-MM-DD HH:mm:ss");
    }

    BasicModel.include({
        /**
         * @override
         */
        _applyChange: function(recordID, changes) {
            // The normal way is to have only one change with the 'CLONE' operation
            // but to ensure that "omitOnchange" is used we check that almost one change
            // is a 'CLONE' operation.
            // TODO: This is done in this way to don't override other "big" methods
            const has_clone_oper = !_.chain(changes)
                .values()
                .filter({operation: "CLONE"})
                .isEmpty()
                .value();
            if (has_clone_oper) {
                return this._applyChangeOmitOnchange.apply(this, arguments);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Force use "omitOnchange" when 'CLONE' operation are performed
         *
         * @override
         */
        _applyX2ManyChange: function(record, fieldName, command) {
            if (command.operation === "CLONE") {
                // Return this._applyX2ManyChangeOmitOnchange.apply(this, arguments);
                return this._cloneX2Many.apply(this, arguments);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Modified implementation of '_applyX2ManyChange' to allow create
         * without trigger onchanges
         *
         * @param {String} recordID
         * @param {Object} changes
         * @param {Object} options
         * @returns {Promise}
         */
        _cloneX2Many: function(record, fieldName, command, options) {
            const localID =
                (record._changes && record._changes[fieldName]) ||
                record.data[fieldName];
            const list = this.localData[localID];
            const context = _.extend({}, this._getContext(list));
            const position = (command && command.position) || "bottom";
            const viewType = (options && options.viewType) || record.viewType;
            const fieldInfo = record.fieldsInfo[viewType][fieldName];
            const record_command = this.get(command.id);
            // Trigger addFieldsInfo on every possible view in the field to avoid
            // errors when loading such views from the cloned line
            const loaded_views = Object.keys(list.fieldsInfo);
            const field_views = Object.keys(fieldInfo.views);
            const to_load_views = field_views.filter(
                value => !loaded_views.includes(value)
            );
            _.each(to_load_views, name => {
                this.addFieldsInfo(localID, {
                    fields: fieldInfo.views[name].fields,
                    fieldInfo: fieldInfo.views[name].fieldsInfo[name],
                    viewType: name,
                });
            });
            // Only load fields available in the views. Otherwise we could get into
            // problems when some process try to get their states.
            var whitelisted_fields = [];
            _.each(_.allKeys(record_command.fieldsInfo), function(view) {
                _.each(_.allKeys(record_command.fieldsInfo[view]), function(field) {
                    if (!whitelisted_fields.includes(field)) {
                        whitelisted_fields.push(field);
                    }
                });
            });

            const params = {
                context: context,
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                allowWarning: options && options.allowWarning,
                viewType: viewType,
                views: fieldInfo.views,
                clone_parent_record_id: command.id,
            };

            let read_data = Promise.resolve();
            if (this.isNew(command.id)) {
                // We need the 'copy_data' of the original parent record
                if (!_.isEmpty(record_command.clone_data)) {
                    params.clone_copy_data = record_command.clone_copy_data;
                }
            } else {
                // Record state only has loaded data and only for the fields defined in the views.
                // For this reason we need ensure copy all the model fields.
                read_data = rpc.query({
                    model: list.model,
                    method: "copy_data",
                    args: [record_command.res_id],
                    kwargs: {context: record.getContext()},
                });
            }

            return read_data.then(result => {
                const clone_values = _.defaults(
                    {},
                    this._getValuesToClone(record_command, params),
                    _.pick(result, whitelisted_fields)
                );
                return this._makeCloneRecord(list.model, params, clone_values)
                    .then(id => {
                        const ids = [id];
                        list._changes = list._changes || [];
                        list._changes.push({
                            operation: "ADD",
                            id: id,
                            position: position,
                            isNew: true,
                        });
                        const local_record = this.localData[id];
                        list._cache[local_record.res_id] = id;
                        if (list.orderedResIDs) {
                            const index =
                                list.offset + (position !== "top" ? list.limit : 0);
                            list.orderedResIDs.splice(index, 0, local_record.res_id);
                            // List could be a copy of the original one
                            this.localData[list.id].orderedResIDs = list.orderedResIDs;
                        }
                        return ids;
                    })
                    .then(ids => {
                        this._readUngroupedList(list).then(() => {
                            const x2ManysDef = this._fetchX2ManysBatched(list);
                            const referencesDef = this._fetchReferencesBatched(list);
                            return Promise.all([x2ManysDef, referencesDef]).then(
                                () => ids
                            );
                        });
                    });
            });
        },

        /**
         * Modified implementation of '_applyChange' to allow changes
         * without trigger onchanges
         *
         * @param {String} recordID
         * @param {Object} changes
         * @param {Object} options
         * @returns {Promise}
         */
        _applyChangeOmitOnchange: function(recordID, changes, options) {
            var record = this.localData[recordID];
            var field = false;
            var defs = [];
            options = options || {};
            record._changes = record._changes || {};
            if (!options.doNotSetDirty) {
                record._isDirty = true;
            }
            // Apply changes to local data
            for (var fieldName in changes) {
                field = record.fields[fieldName];
                if (
                    field &&
                    (field.type === "one2many" || field.type === "many2many")
                ) {
                    defs.push(
                        this._applyX2ManyChange(
                            record,
                            fieldName,
                            changes[fieldName],
                            options
                        )
                    );
                } else if (
                    field &&
                    (field.type === "many2one" || field.type === "reference")
                ) {
                    defs.push(
                        this._applyX2OneChange(record, fieldName, changes[fieldName])
                    );
                } else {
                    record._changes[fieldName] = changes[fieldName];
                }
            }
            return Promise.all(defs).then(() => _.keys(changes));
        },

        /**
         * Modified implementation of '_performOnChange' to properly unfold the cloned
         * record properties son we can interact with it as if we'd created it. We
         * don't really do an onchange and the only fields that we're getting are those
         * relational.
         *
         * @param {Object} record
         * @param {String} [viewType] current viewType. If not set, we will assume
         *   main viewType from the record
         * @returns {Promise}
         */
        _pseudoOnChange: function(record, viewType) {
            var self = this;
            var onchangeSpec = this._buildOnchangeSpecs(record, viewType);
            if (!onchangeSpec) {
                return Promise.resolve();
            }
            var idList = record.data.id ? [record.data.id] : [];
            var options = {
                full: true,
            };
            var context = this._getContext(record, options);
            var currentData = this._generateOnChangeData(record, {changesOnly: false});

            return self
                ._rpc({
                    model: record.model,
                    method: "onchange",
                    args: [idList, currentData, [], onchangeSpec],
                    context: context,
                })
                .then(function(result) {
                    if (!record._changes) {
                        // If the _changes key does not exist anymore, it means that
                        // it was removed by discarding the changes after the rpc
                        // to onchange. So, in that case, the proper response is to
                        // ignore the onchange.
                        return;
                    }
                    if (result.warning) {
                        self.trigger_up("warning", result.warning);
                        record._warning = true;
                    }
                    if (result.domain) {
                        record._domains = _.extend(record._domains, result.domain);
                    }
                    // We're only interested in relational fields
                    const values = _.pick(result.value, v => {
                        return typeof v === "object";
                    });
                    return self._applyOnChange(values, record).then(function() {
                        return result;
                    });
                });
        },

        _makeCloneRecord: function(modelName, params, values) {
            const targetView = params.viewType;
            let fields = params.fields;
            const fieldsInfo = params.fieldsInfo;

            // Get available fields
            for (const view_type in params.views) {
                fields = _.defaults({}, fields, params.views[view_type].fields);
            }
            let fieldNames = Object.keys(fields);
            // Fields that are present in the originating view, that need to be initialized
            // Hence preventing their value to crash when getting back to the originating view
            const parentRecord =
                params.parentID && this.localData[params.parentID].type === "list"
                    ? this.localData[params.parentID]
                    : null;
            if (parentRecord && parentRecord.viewType in parentRecord.fieldsInfo) {
                const originView = parentRecord.viewType;
                fieldNames = _.union(
                    fieldNames,
                    Object.keys(parentRecord.fieldsInfo[originView])
                );
                fieldsInfo[targetView] = _.defaults(
                    {},
                    fieldsInfo[targetView],
                    parentRecord.fieldsInfo[originView]
                );
                fields = _.defaults({}, fields, parentRecord.fields);
            }
            const record = this._makeDataPoint({
                modelName: modelName,
                fields: fields,
                fieldsInfo: fieldsInfo,
                context: params.context,
                parentID: params.parentID,
                res_ids: params.res_ids,
                viewType: targetView,
            });
            // Extend dataPoint with clone info
            record.clone_data = {
                record_parent_id: params.clone_parent_record_id,
                copy_data: params.clone_copy_data || values,
            };

            // We want to overwrite the default value of the handle field (if any),
            // in order for new lines to be added at the correct position.
            // -> This is a rare case where the defaul_get from the server
            //    will be ignored by the view for a certain field (usually "sequence").

            var overrideDefaultFields = this._computeOverrideDefaultFields(
                params.parentID,
                params.position
            );

            if (overrideDefaultFields) {
                values[overrideDefaultFields.field] = overrideDefaultFields.value;
            }
            const _this = this;
            return (
                this.applyDefaultValues(record.id, values, {fieldNames: fieldNames})
                    // This will ensure we refresh the proper properties
                    .then(() => {
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
                            _this
                                ._pseudoOnChange(record, targetView)
                                .then(always)
                                .guardedCatch(always);
                        });
                        return def;
                    })
                    .then(() => {
                        return this._fetchRelationalData(record);
                    })
                    .then(() => {
                        return this._postprocess(record);
                    })
                    .then(() => {
                        // Save initial changes, so they can be restored later,
                        // if we need to discard.
                        this.save(record.id, {savePoint: true});
                        return record.id;
                    })
            );
        },

        /**
         * Get the values formatted to clone
         *
         * @param {Object} line_state
         * @param {Object} params
         * @returns {Object}
         */
        _getValuesToClone: function(line_state, params) {
            const values_to_clone = {};
            const line_data = line_state.data;
            for (const field_name in line_data) {
                if (field_name === "id") {
                    continue;
                }
                const value = line_data[field_name];
                const field_info = params.fields[field_name];
                if (!field_info) {
                    continue;
                }
                if (field_info.type !== "boolean" && !value) {
                    values_to_clone[field_name] = value;
                } else if (field_info.type === "many2one") {
                    const rec_id = value.data && value.data.id;
                    values_to_clone[field_name] = rec_id || false;
                } else if (field_info.type === "many2many") {
                    values_to_clone[field_name] = [
                        [
                            6,
                            0,
                            _.map(value.data || [], item => {
                                return item.data.id;
                            }),
                        ],
                    ];
                } else if (field_info.type === "one2many") {
                    values_to_clone[field_name] = _.map(value.data || [], item => {
                        return [
                            0,
                            0,
                            this._getValuesToClone(item, {fields: value.fields}),
                        ];
                    });
                } else if (
                    field_info.type === "date" ||
                    field_info.type === "datetime"
                ) {
                    values_to_clone[field_name] = dateToServer(value);
                } else {
                    values_to_clone[field_name] = value;
                }
            }
            return values_to_clone;
        },

        _generateChanges: function(record) {
            let res = this._super.apply(this, arguments);
            if (!_.isEmpty(record.clone_data)) {
                // If a cloned record, ensure that all fields are written (and not only the view fields)
                res = _.extend({}, record.clone_data.copy_data, res);
            }
            return res;
        },
    });
});
