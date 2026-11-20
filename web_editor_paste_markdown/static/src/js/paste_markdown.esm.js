/** @odoo-module **/
/* Copyright 2025 Yves Goldberg (Ygol InternetWork)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 *
 * Adds a "Paste Markdown" command to the powerbox (/ menu) of HTML fields.
 * It opens a dialog where the user pastes Markdown, previews the result and
 * inserts the converted HTML into the editor. The conversion uses the Toast UI
 * Editor library loaded by web_widget_markdown_editor.
 */

import {Component, onMounted, useRef, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {HtmlField} from "@web_editor/js/backend/html_field";
import {escape} from "@web/core/utils/strings";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

/**
 * Add inline styles and Bootstrap classes so that the HTML renders in the
 * Odoo editor (and in e-mails) like the Toast UI preview.
 *
 * @param {String} html HTML produced by Toast UI
 * @returns {String} styled HTML
 */
export function makeHtmlOdooCompatible(html) {
    if (!html) {
        return html;
    }
    const temp = document.createElement("div");
    temp.innerHTML = html;

    for (const table of temp.querySelectorAll("table")) {
        table.classList.add("table", "table-bordered", "o_table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.marginBottom = "1rem";
    }
    for (const cell of temp.querySelectorAll("th, td")) {
        cell.style.border = "1px solid #dee2e6";
        cell.style.padding = "0.5rem";
    }
    for (const th of temp.querySelectorAll("th")) {
        th.style.backgroundColor = "#f8f9fa";
        th.style.fontWeight = "600";
    }
    for (const pre of temp.querySelectorAll("pre")) {
        pre.style.backgroundColor = "#f6f8fa";
        pre.style.padding = "1rem";
        pre.style.borderRadius = "4px";
        pre.style.overflow = "auto";
    }
    for (const code of temp.querySelectorAll("code")) {
        if (!code.parentElement || code.parentElement.tagName !== "PRE") {
            code.style.backgroundColor = "rgba(27, 31, 35, 0.05)";
            code.style.padding = "0.2em 0.4em";
            code.style.borderRadius = "3px";
            code.style.fontSize = "85%";
        }
    }
    for (const bq of temp.querySelectorAll("blockquote")) {
        bq.style.borderLeft = "4px solid #dfe2e5";
        bq.style.paddingLeft = "1em";
        bq.style.color = "#6a737d";
        bq.style.margin = "0.5rem 0";
    }
    return temp.innerHTML;
}

/**
 * Convert Markdown to HTML with the Toast UI viewer, rendered off screen.
 *
 * Without Toast UI, the text is returned escaped in a paragraph.
 *
 * @param {String} markdown Markdown source
 * @returns {String} HTML ready to insert in an Odoo HTML field
 */
export function markdownToHtml(markdown) {
    if (!markdown || !markdown.trim()) {
        return "";
    }
    const Editor = window.toastui && window.toastui.Editor;
    if (!Editor) {
        console.error("Toast UI Editor not loaded");
        return `<p>${escape(markdown)}</p>`;
    }
    const tempContainer = document.createElement("div");
    tempContainer.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
    document.body.appendChild(tempContainer);
    try {
        const viewer = Editor.factory({
            el: tempContainer,
            viewer: true,
            initialValue: markdown,
        });
        const contentsEl = tempContainer.querySelector(".toastui-editor-contents");
        const html = contentsEl ? contentsEl.innerHTML : "";
        viewer.destroy();
        return makeHtmlOdooCompatible(html);
    } catch (e) {
        console.error("Error converting markdown:", e);
        return `<p>${escape(markdown)}</p>`;
    } finally {
        document.body.removeChild(tempContainer);
    }
}

/**
 * Parse an HTML string into a DocumentFragment (as OdooEditor's parseHTML).
 *
 * @param {String} html
 * @returns {DocumentFragment}
 */
function parseHtmlToFragment(html) {
    const fragment = document.createDocumentFragment();
    const parsedDocument = new DOMParser().parseFromString(html, "text/html");
    fragment.append(...parsedDocument.body.childNodes);
    return fragment;
}

/**
 * Dialog where the user pastes Markdown and sees the HTML preview.
 */
export class PasteMarkdownDialog extends Component {
    setup() {
        this.state = useState({markdownContent: ""});
        this.textareaRef = useRef("markdownTextarea");
        this.previewRef = useRef("htmlPreview");
        onMounted(() => {
            if (this.textareaRef.el) {
                this.textareaRef.el.focus();
            }
        });
    }

    _updatePreview() {
        if (this.previewRef.el) {
            this.previewRef.el.innerHTML = markdownToHtml(this.state.markdownContent);
        }
    }

    onMarkdownInput(ev) {
        this.state.markdownContent = ev.target.value;
        this._updatePreview();
    }

    onConfirm() {
        const html = markdownToHtml(this.state.markdownContent);
        this.props.close();
        if (html) {
            this.props.onConfirm(html);
        }
    }

    onCancel() {
        this.props.close();
    }
}

PasteMarkdownDialog.template = "web_editor_paste_markdown.PasteMarkdownDialog";
PasteMarkdownDialog.components = {Dialog};
PasteMarkdownDialog.props = {
    close: Function,
    onConfirm: Function,
};

patch(HtmlField.prototype, "web_editor_paste_markdown.HtmlField", {
    setup() {
        this._super(...arguments);
        this.dialogService = useService("dialog");
    },

    get wysiwygOptions() {
        const options = this._super(...arguments);
        const pasteMarkdownCommand = {
            category: this.env._t("Basic blocks"),
            name: this.env._t("Paste Markdown"),
            priority: 50,
            description: this.env._t("Convert Markdown to HTML"),
            fontawesome: "fa-file-code-o",
            callback: () => this._openPasteMarkdownDialog(),
        };
        options.powerboxCommands = [
            ...(options.powerboxCommands || []),
            pasteMarkdownCommand,
        ];
        return options;
    },

    _openPasteMarkdownDialog() {
        this.dialogService.add(PasteMarkdownDialog, {
            onConfirm: (html) => {
                if (!html || !this.wysiwyg || !this.wysiwyg.odooEditor) {
                    return;
                }
                const editor = this.wysiwyg.odooEditor;
                this.wysiwyg.focus();
                // Reason: the selection comes back to the editor only once the
                // dialog is closed; inserting at once would lose the caret.
                setTimeout(() => {
                    try {
                        editor.execCommand("insert", parseHtmlToFragment(html));
                        editor.historyStep();
                    } catch (e) {
                        console.error("Markdown insertion failed:", e);
                    }
                }, 100);
            },
        });
    },
});
