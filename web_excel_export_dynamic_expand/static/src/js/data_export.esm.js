/* Copyright 2024 Forgeflow
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web_excel_export_dynamic_expand.DataExport", function (require) {
    var DataExport = require("web.DataExport");

    DataExport.include({
        /**
         * @override
         */
        _exportData: function () {
            var hasDataRow = $(".o_data_row").length > 0;
            var hasGroup = $(".o_group_header").length > 0;
            var collapseGroups = !hasDataRow && hasGroup;

            var originalGetContext = this.record.getContext;
            this.record.getContext = function () {
                var context = originalGetContext.call(this);
                context.collapse_groups = collapseGroups;
                return context;
            };
            this._super(...arguments);
        },
    });
});
