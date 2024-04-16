/* Copyright 2021 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_widget_one2many_tree_line_duplicate.BasicModel", function (require) {
    "use strict";

    const BasicModel = require("web.BasicModel");
    const rpc = require("web.rpc");

    function dateToServer(date) {
        return date.clone().utc().locale("en").format("YYYY-MM-DD HH:mm:ss");
    }

    BasicModel.include({
        /**
         * @override
         */
        _applyChange: function (recordID, changes) {
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
        _applyX2ManyChange: function (record, fieldName, command) {
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
        _cloneX2Many: function (record, fieldName, command, options) {
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
                (value) => !loaded_views.includes(value)
            );
            _.each(to_load_views, (name) => {
                this.addFieldsInfo(localID, {
                    fields: fieldInfo.views[name].fields,
                    fieldInfo: fieldInfo.views[name].fieldsInfo[name],
                    viewType: name,
                });
            });
            // Only load fields available in the views. Otherwise we could get into
            // problems when some process try to get their states.
            var whitelisted_fields = [];
            _.each(_.allKeys(record_command.fieldsInfo), function (view) {
                _.each(_.allKeys(record_command.fieldsInfo[view]), function (field) {
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

            return read_data.then((result) => {
                const clone_values = _.defaults(
                    {},
                    this._getValuesToClone(record_command, params),
                    _.pick(result, whitelisted_fields)
                );
                return this._makeCloneRecord(list.model, params, clone_values)
                    .then((id) => {
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
                    .then((ids) => {
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
        _applyChangeOmitOnchange: function (recordID, changes, options) {
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

        applyDefaultValues: function (recordID, values, options) {
            options = options || {};
            var record = this.localData[recordID];
            var viewType = options.viewType || record.viewType;
            var fieldNames =
                options.fieldNames || Object.keys(record.fieldsInfo[viewType]);
            record._changes = record._changes || {};

            // Ignore values for non requested fields (for instance, fields that are
            // not in the view)
            values = _.pick(values, fieldNames);

            // Fill default values for missing fields
            for (var i = 0; i < fieldNames.length; i++) {
                var fieldName = fieldNames[i];
                if (!(fieldName in values) && !(fieldName in record._changes)) {
                    var field = record.fields[fieldName];
                    if (
                        field.type === "float" ||
                        field.type === "integer" ||
                        field.type === "monetary"
                    ) {
                        values[fieldName] = 0;
                    } else if (
                        field.type === "one2many" ||
                        field.type === "many2many"
                    ) {
                        values[fieldName] = [];
                    } else {
                        values[fieldName] = null;
                    }
                }
            }

            // Parse each value and create dataPoints for relational fields
            var defs = [];
            for (var fieldName in values) {
                var field = record.fields[fieldName];
                record.data[fieldName] = null;
                if (field.type === "many2one" && values[fieldName]) {
                    var dp = this._makeDataPoint({
                        context: record.context,
                        data: {id: values[fieldName]},
                        modelName: field.relation,
                        parentID: record.id,
                    });
                    record._changes[fieldName] = dp.id;
                } else if (field.type === "reference" && values[fieldName]) {
                    var ref = values[fieldName].split(",");
                    var dp = this._makeDataPoint({
                        context: record.context,
                        data: {id: parseInt(ref[1])},
                        modelName: ref[0],
                        parentID: record.id,
                    });
                    defs.push(this._fetchNameGet(dp));
                    record._changes[fieldName] = dp.id;
                } else if (field.type === "one2many" || field.type === "many2many") {
                    defs.push(
                        this._processX2ManyCommands(
                            record,
                            fieldName,
                            values[fieldName],
                            options
                        )
                    );
                } else {
                    record._changes[fieldName] = this._parseServerValue(
                        field,
                        values[fieldName]
                    );
                }
            }

            return Promise.all(defs);
        },

        _makeCloneRecord: function (modelName, params, values) {
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
            const _this = this;
            return (
                this.applyDefaultValues(record.id, values, {fieldNames: fieldNames})
                    // This will ensure we refresh the proper properties
                    .then(() => {
                        var def = new Promise(function (resolve, reject) {
                            var always = function () {
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
                                ._performOnChange(record, [], {})
                                .then(always)
                                .guardedCatch(always);
                        });
                        return def;
                    })
                    .then(() => {
                        // Inject always_reload to many2one fieldsInfo
                        for (var key of Object.keys(record.fieldsInfo[targetView])) {
                            if (record.fields[key].type === "many2one") {
                                const old_reload_value =
                                    record.fieldsInfo[targetView][key].options &&
                                    record.fieldsInfo[targetView][key].options
                                        .always_reload;
                                record.fieldsInfo[targetView][key].options = {
                                    ...record.fieldsInfo[targetView][key].options,
                                    always_reload: true,
                                    old_reload_value,
                                };
                            }
                        }
                        return this._postprocess(record);
                    })
                    .then(() => {
                        // Recover always_reload state before injection to many2one fieldsInfo
                        for (var key of Object.keys(record.fieldsInfo[targetView])) {
                            if (
                                record.fieldsInfo[targetView][key].options &&
                                "old_reload_value" in
                                    record.fieldsInfo[targetView][key].options
                            ) {
                                const old_reload_value =
                                    record.fieldsInfo[targetView][key].options
                                        .old_reload_value;
                                record.fieldsInfo[targetView][
                                    key
                                ].options.always_reload = old_reload_value;
                            }
                        }
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
        _getValuesToClone: function (line_state, params) {
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
                            _.map(value.data || [], (item) => {
                                return item.data.id;
                            }),
                        ],
                    ];
                } else if (field_info.type === "one2many") {
                    values_to_clone[field_name] = _.map(value.data || [], (item) => {
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

        _generateChanges: function (record) {
            let res = this._super.apply(this, arguments);
            if (!_.isEmpty(record.clone_data)) {
                // If a cloned record, ensure that all fields are written (and not only the view fields)
                res = _.extend({}, record.clone_data.copy_data, res);
            }
            return res;
        },
    });
});
