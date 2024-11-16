/** @odoo-module **/
import {Wysiwyg} from "@web_editor/js/wysiwyg/wysiwyg";
import {createCustomCssFormats} from "../odoo-editor/utils.esm";
import {patch} from "@web/core/utils/patch";

patch(Wysiwyg.prototype, {
    _configureToolbar(options) {
        super._configureToolbar(options);
        if (
            options.toolbarOptions.custom_class_css &&
            options.toolbarOptions.custom_class_css.length > 0
        ) {
            this.odooEditor.custom_class_css = options.toolbarOptions.custom_class_css;
            createCustomCssFormats(options.toolbarOptions.custom_class_css);
        }
    },
});
