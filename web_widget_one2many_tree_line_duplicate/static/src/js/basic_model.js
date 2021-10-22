/* Copyright 2021 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_widget_one2many_tree_line_duplicate.BasicModel", function(require) {
    "use strict";

    const BasicModel = require("web.BasicModel");

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
                return this._applyX2ManyChangeOmitOnchange.apply(this, arguments);
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
        _applyX2ManyChangeOmitOnchange: function(record, fieldName, command, options) {
            var localID =
                (record._changes && record._changes[fieldName]) ||
                record.data[fieldName];
            var list = this.localData[localID];
            var position = (command && command.position) || "top";
            var viewType = (options && options.viewType) || record.viewType;
            var fieldInfo = record.fieldsInfo[viewType][fieldName];
            var view = fieldInfo.views && fieldInfo.views[fieldInfo.mode];
            var params = {
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                viewType: view ? view.type : fieldInfo.viewType,
                allowWarning: options && options.allowWarning,
            };

            if (
                command.position === "bottom" &&
                list.orderedResIDs &&
                list.orderedResIDs.length >= list.limit
            ) {
                list.tempLimitIncrement = (list.tempLimitIncrement || 0) + 1;
                list.limit += 1;
            }

            const record_state = this.get(command.id);
            const clone_values = this._getValuesToClone(record_state);
            return this._makeDefaultRecordOmitOnchange(list.model, params, clone_values)
                .then(id => {
                    var ids = [id];
                    list._changes = list._changes || [];
                    list._changes.push({
                        operation: "ADD",
                        id: id,
                        position: position,
                        isNew: true,
                    });
                    var record = this.localData[id];
                    list._cache[record.res_id] = id;
                    if (list.orderedResIDs) {
                        var index = list.offset + (position !== "top" ? list.limit : 0);
                        list.orderedResIDs.splice(index, 0, record.res_id);
                        // List could be a copy of the original one
                        this.localData[list.id].orderedResIDs = list.orderedResIDs;
                    }
                    return ids;
                })
                .then(ids => {
                    this._readUngroupedList(list).then(() => {
                        var x2ManysDef = this._fetchX2ManysBatched(list);
                        var referencesDef = this._fetchReferencesBatched(list);
                        return Promise.all([x2ManysDef, referencesDef]).then(() => ids);
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
         * Modified implementation of '_makeDefaultRecord' to allow create
         * without trigger onchanges/default values
         *
         * @param {String} modelName
         * @param {Object} params
         * @param {Object} values
         * @returns {Promise}
         */
        _makeDefaultRecordOmitOnchange: function(modelName, params, values) {
            const targetView = params.viewType;
            let fields = params.fields;
            const fieldsInfo = params.fieldsInfo;
            let fieldNames = Object.keys(fieldsInfo[targetView]);
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

            return this.applyDefaultValues(record.id, values, {fieldNames: fieldNames})
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
                });
        },

        /**
         * Get the values formatted to clone
         *
         * @param {Object} line_state
         * @returns {Object}
         */
        _getValuesToClone: function(line_state) {
            const values_to_clone = {};
            const line_data = line_state.data;
            for (const field_name in line_data) {
                if (field_name === "id") {
                    continue;
                }
                const value = line_data[field_name];
                const field_info = line_state.fields[field_name];
                if (!field_info) {
                    continue;
                }
                if (field_info.type !== "boolean" && !value) {
                    values_to_clone[field_name] = value;
                } else if (field_info.type === "many2one") {
                    const rec_id = value.data && value.data.id;
                    values_to_clone[field_name] = rec_id || false;
                } else if (
                    field_info.type === "many2many" ||
                    field_info.type === "one2many"
                ) {
                    values_to_clone[field_name] = _.map(value.data || [], item => {
                        return item.data.id;
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
    });
});
