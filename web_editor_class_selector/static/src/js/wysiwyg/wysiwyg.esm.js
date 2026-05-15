import {Wysiwyg} from "@html_editor/wysiwyg";
import {createCustomCssFormats} from "../utils/utils.esm";
import {patch} from "@web/core/utils/patch";

patch(Wysiwyg.prototype, {
    getEditorConfig() {
        const res = super.getEditorConfig(...arguments);
        if (
            this.props.config.custom_class_css &&
            this.props.config.custom_class_css.length > 0
        ) {
            createCustomCssFormats(this.props.config.custom_class_css);
        }
        return res;
    },
});
