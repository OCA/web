/** @odoo-module */

import {Toolbar} from "@web_editor/js/editor/toolbar";
import {patch} from "@web/core/utils/patch";

patch(Toolbar.props, {
    ...Toolbar.props,
    custom_class_css: {type: Array, optional: true},
});
patch(Toolbar.defaultProps, {
    ...Toolbar.defaultProps,
    custom_class_css: [],
});
