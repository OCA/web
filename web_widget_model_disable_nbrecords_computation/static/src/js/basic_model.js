odoo.define("webWidgetModelDisableNbRecordsComputation.BasicModel", function (require) {
    "use strict";
    var BasicModel = require("web.BasicModel");

    BasicModel.include({
        _fetchSpecialDomain: function (record, fieldName, fieldInfo) {
            var self = this;
            var _super = this._super.bind(this);
            var _arguments = arguments;
            var domainModel = fieldInfo.options.model;
            if (record.data.hasOwnProperty(domainModel)) {
                domainModel =
                    (record._changes && record._changes[domainModel]) ||
                    record.data[domainModel];
            }

            var active_company_id = record.context.allowed_company_ids[0];

            return self
                ._rpc({
                    model: "res.company",
                    method: "search_read",
                    fields: ["field_domain_widget_default_auto_fetch_nbrecords"],
                    domain: [["id", "=", active_company_id]],
                })
                .then(function (rec) {
                    var defaultAutoFetch =
                        rec.length < 1
                            ? true
                            : rec[0].field_domain_widget_default_auto_fetch_nbrecords;
                    if (defaultAutoFetch) {
                        if (
                            fieldInfo.options.autoFetch != undefined &&
                            !fieldInfo.options.autoFetch
                        ) {
                            return Promise.resolve({
                                model: domainModel,
                                nbRecords: -1,
                            });
                        }
                        return _super.apply(this, _arguments);
                    }
                    if (
                        !defaultAutoFetch &&
                        fieldInfo.options.autoFetch != undefined &&
                        fieldInfo.options.autoFetch
                    ) {
                        return _super.apply(this, _arguments);
                    }
                    return Promise.resolve({
                        model: domainModel,
                        nbRecords: -1,
                    });
                });
        },
    });
});
