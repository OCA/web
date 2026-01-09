/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {registry} from "@web/core/registry";
import {scroll} from "@web/../tests/utils";

registry.category("web_tour.tours").add("html_editor_disable_chatgpt_tour", {
    url: "/odoo/res.partner/3",
    steps: () => [
        {
            content: "Click on Internal Notes tab",
            trigger: ".o_notebook_headers a[name='internal_notes']",
            run: "click",
        },
        {
            trigger: ".note-editable.odoo-editor-editable",
            run: "click",
        },
        {
            content: "Enter text",
            trigger: ".note-editable.odoo-editor-editable .o-paragraph",
            run: "editor text",
        },
        {
            content: "Highlight text",
            trigger: ".note-editable.odoo-editor-editable .o-paragraph",
            run: "dblclick",
        },
        {
            content: "Ensure toolbar buttons are absent",
            trigger: ".o-we-toolbar",
            async run() {
                if (document.querySelector(".o-we-toolbar .btn[name='chatgpt']")) {
                    throw new Error("ChatGPT button should be absent");
                }
                if (document.querySelector(".o-we-toolbar .btn[name='translate']")) {
                    throw new Error("Translate with AI button should be absent");
                }
            },
        },
        {
            content: "Clear text",
            trigger: ".note-editable.odoo-editor-editable",
            run: "editor",
        },
        {
            content: "Open Powerbox",
            trigger: ".note-editable.odoo-editor-editable",
            async run(actions) {
                await actions.editor("/");
                document.querySelector(".note-editable").dispatchEvent(
                    new InputEvent("input", {
                        inputType: "insertText",
                        data: "/",
                    })
                );
            },
        },
        {
            content: "Ensure command is absent",
            trigger: "div.o-we-powerbox",
            async run() {
                await scroll(".o-we-powerbox", "bottom");
                for (const node of document.querySelectorAll(
                    ".o-we-powerbox .o-we-command-name"
                )) {
                    if (node.textContent && node.textContent.includes("ChatGPT")) {
                        throw new Error("ChatGPT command should be absent");
                    }
                }
            },
        },
        {
            content: "Discard changes",
            trigger: ".o_form_button_cancel",
            run: "click",
        },
    ],
});
