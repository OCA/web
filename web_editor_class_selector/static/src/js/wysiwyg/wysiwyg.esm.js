/** @odoo-module **/
import Wysiwyg from "web_editor.wysiwyg";
import core from "web.core";
import {createCustomCssFormats} from "../odoo-editor/utils.esm";

const Qweb = core.qweb;

Wysiwyg.include({
    _configureToolbar: function (options) {
        this._super(options);
        if (options.custom_class_css && options.custom_class_css.length > 0) {
            const $dialogContent = $(
                Qweb.render("web_editor_class_selector.custom_class_css", {
                    custom_class_css: options.custom_class_css,
                })
            );
            $dialogContent.appendTo(this.toolbar.$el);
            // Binding the new commands to the editor
            // to react to the click on the new options
            this.odooEditor.bindExecCommand($dialogContent[0]);
            this.odooEditor.custom_class_css = options.custom_class_css;
            createCustomCssFormats(options.custom_class_css);
        }
    },
});
