/** @odoo-module **/
import {editorCommands} from "@web_editor/js/editor/odoo-editor/src/commands/commands";
import {formatSelection} from "@web_editor/js/editor/odoo-editor/src/utils/utils";

const newCommands = {
    setCustomCss: (editor, ...args) => {
        const selectedId = parseInt(args[0], 10);
        const record = editor.custom_class_css.find((item) => item.id === selectedId);
        formatSelection(editor, record.class_name);
    },
};
Object.assign(editorCommands, newCommands);
