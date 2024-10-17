// Copyright 2024 ForgeFlow S.L. (https://www.forgeflow.com)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_duplicate_context.BasicModel", function(require) {
    "use strict";

    var BasicModel = require("web.BasicModel");

    BasicModel.include({
        duplicateRecord: function(recordID) {
            var self = this;
            var record = this.localData[recordID];
            // Start of the hook
            var context = this._getContext(record, {
                additionalContext: {from_duplicate: true},
            });
            // End of the hook
            return this._rpc({
                model: record.model,
                method: "copy",
                args: [record.data.id],
                context: context,
            }).then(function(res_id) {
                var index = record.res_ids.indexOf(record.res_id);
                record.res_ids.splice(index + 1, 0, res_id);
                return self.load({
                    fieldsInfo: record.fieldsInfo,
                    fields: record.fields,
                    modelName: record.model,
                    res_id: res_id,
                    res_ids: record.res_ids.slice(0),
                    viewType: record.viewType,
                    context: context,
                });
            });
        },
    });
});
