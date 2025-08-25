/** @odoo-module **/
import {patch} from "@web/core/utils/patch";
import {ListController} from "@web/views/list/list_controller";

patch(ListController.prototype, "export_html_as_text.controller_flag", {
    async downloadExport(fields, import_compat, format) {
        const dialog =
            document.querySelector(".o_export_data_dialog") ||
            document.querySelector(".o_export");
        const el = dialog && dialog.querySelector("#o-export-html-as-text");
        const checked = Boolean(el && el.checked);
        const prev = this.props.context;
        this.props.context = {...(prev || {}), export_html_as_text: checked};
        try {
            return await this._super(fields, import_compat, format);
        } finally {
            this.props.context = prev;
        }
    },
});
