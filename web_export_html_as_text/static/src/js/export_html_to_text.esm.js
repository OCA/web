/** @odoo-module **/
import {patch} from "@web/core/utils/patch";
import {ExportDataDialog} from "@web/views/view_dialogs/export_data_dialog";

patch(ExportDataDialog.prototype, {
    setup() {
        super.setup();
        const originalDownload = this.props.download;
        this.props.download = async (fields, import_compat, format) => {
            const dialog = document.querySelector(".o_export_data_dialog");
            const elAnywhere = document.querySelector("#o-export-html-as-text");
            const el = dialog?.querySelector("#o-export-html-as-text") || elAnywhere;
            const exportHtmlAsText = Boolean(el && el.checked);
            const {root} = this.props;
            const ctx = root.context;
            const hadKey = Object.prototype.hasOwnProperty.call(
                ctx,
                "export_html_as_text"
            );
            const prev = ctx.export_html_as_text;

            ctx.export_html_as_text = exportHtmlAsText;
            try {
                return await originalDownload(fields, import_compat, format);
            } finally {
                if (hadKey) {
                    ctx.export_html_as_text = prev;
                } else {
                    delete ctx.export_html_as_text;
                }
            }
        };
    },
});
