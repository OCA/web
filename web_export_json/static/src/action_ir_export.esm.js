/** @odoo-module **/

/* Copyright 2023 Kencove (https://kencove.com).
 @author Mohamed Alkobrosli <malkobrosly@kencove.com>
 License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {patch} from "@web/core/utils/patch";
import {ExportDataDialog} from "@web/views/view_dialogs/export_data_dialog";

patch(ExportDataDialog, "extend_export_data_dialog_1", {
    template: "web_export_json.CustomExportDataDialog",
});

patch(ExportDataDialog.prototype, "extend_export_data_dialog_2", {
    setup() {
        this._super(...arguments);
    },
});
