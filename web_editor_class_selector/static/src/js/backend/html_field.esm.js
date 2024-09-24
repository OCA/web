/** @odoo-module **/
import {HtmlField} from "@web_editor/js/backend/html_field";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

const {onWillStart} = owl;

patch(HtmlField.prototype, "web_editor_class_selector.HtmlField", {
    setup() {
        this._super(...arguments);
        this.orm = useService("orm");
        this.custom_class_css = [];
        onWillStart(async () => {
            this.custom_class_css = await this.orm.searchRead(
                "web.editor.class",
                [],
                ["name", "class_name"]
            );
        });
    },
    async startWysiwyg(wysiwyg) {
        // Provide the custom class css to the wysiwyg editor
        // to render the custom class css in the toolbar
        wysiwyg.options.custom_class_css = this.custom_class_css;
        return this._super(wysiwyg);
    },
});
