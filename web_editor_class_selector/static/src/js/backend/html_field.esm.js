/** @odoo-module **/
import {HtmlField} from "@web_editor/js/backend/html_field";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

const {onWillStart} = owl;

patch(HtmlField.prototype, {
    setup() {
        super.setup(...arguments);
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
    get wysiwygOptions() {
        // Provide the custom_class_css to the toolbar through the toolbarOptions.
        return {
            ...super.wysiwygOptions,
            toolbarOptions: {
                ...super.wysiwygOptions.toolbarOptions,
                custom_class_css: this.custom_class_css,
            },
        };
    },
});
