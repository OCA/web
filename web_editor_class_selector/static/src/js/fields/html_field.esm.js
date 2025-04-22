import {CssSelectorPlugin} from "../css_selector/css_selector_plugin.esm";
import {HtmlField} from "@html_editor/fields/html_field";
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
    getConfig() {
        // Add the new Plugin to the list of plugins.
        // Provide the custom_class_css to the toolbar.
        const config = super.getConfig(...arguments);
        config.Plugins.push(CssSelectorPlugin);
        config.custom_class_css = this.custom_class_css;
        return config;
    },
});
