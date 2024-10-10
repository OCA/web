/* Copyright 2023 Grupo Isonor - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_one2many_domain.BasicModel", function (require) {
    "use strict";

    const BasicModel = require("web.BasicModel");

    BasicModel.include({
        /**
         * @override
         */
        _fetchRecord: function (record, options) {
            options = options || {};
            let fieldNames = options.fieldNames || record.getFieldNames(options);
            fieldNames = _.uniq(fieldNames.concat(["display_name"]));
            const viewFieldsInfo = record.fieldsInfo[record.viewType];
            const one2many_fieldNames = _.filter(
                fieldNames,
                (fieldName) =>
                    record.fields[fieldName].type === "one2many" &&
                    viewFieldsInfo[fieldName].domain
            );
            if (!one2many_fieldNames.length) {
                // Nothing to handle, use the Odoo implementation
                return this._super.apply(this, arguments);
            }

            // Fields to 'read'
            // FIXME: Here we read all fields (included one2many) to ensure correct ids cache.
            // Maybe in the future can do something like: const readFieldNames = _.difference(fieldNames, one2many_fieldNames);
            // and use 'readFieldNames' in the read rpc and parseServerData call.
            return this._rpc({
                model: record.model,
                method: "read",
                args: [[record.res_id], fieldNames],
                context: _.extend({bin_size: true}, record.getContext()),
            })
                .then((result) => {
                    if (result.length === 0) {
                        return Promise.reject();
                    }
                    result = result[0];
                    record.data = _.extend({}, record.data, result);
                })
                .then(() => {
                    this._parseServerData(fieldNames, record, record.data);
                })
                .then(() => {
                    const proms = [];
                    // The one2many fields
                    for (const fieldName of one2many_fieldNames) {
                        let field = record.fields[fieldName];
                        if (field.related) {
                            field = record.fields[field.related];
                        }
                        const fieldRelated = field.relation_field;
                        const sDomain = [[fieldRelated, "in", record.res_ids]].concat(
                            record.getDomain({fieldName: field.name})
                        );
                        // Can't limit the query because the pager uses the array of ids instead of launch a count query.
                        // This results in longer initial load times, but better paging times.
                        proms.push(
                            this._rpc({
                                model: field.relation,
                                method: "search_read",
                                kwargs: {
                                    fields: ["id"],
                                    domain: sDomain,
                                },
                                context: _.extend(
                                    {bin_size: true},
                                    record.getContext()
                                ),
                            })
                        );
                    }
                    return Promise.all(proms).then((values) => {
                        for (const index in one2many_fieldNames) {
                            record.data[one2many_fieldNames[index]] = _.map(
                                values[index],
                                "id"
                            );
                        }
                        this._parseServerData(one2many_fieldNames, record, record.data);
                    });
                })
                .then(() => {
                    return Promise.all([
                        this._fetchX2Manys(record, options),
                        this._fetchReferences(record, options),
                    ]).then(() => {
                        return this._postprocess(record, options);
                    });
                });
        },
    });
});
