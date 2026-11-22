/** @odoo-module **/
/* Copyright 2025 Yves Goldberg (Ygol InternetWork)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 *
 * Adds two commands to the HTML fields:
 * - "Paste Markdown" (powerbox, / menu): a dialog where the user pastes
 *   Markdown, previews the result and inserts the converted HTML;
 * - "To Markdown" (powerbox for the whole field, toolbar button for the
 *   selection): the same dialog filled with the content converted to Markdown,
 *   to copy it or to replace the content after editing it.
 * Nothing is stored as Markdown: the field keeps its HTML. The conversions use
 * the libraries shipped in static/lib: markdown-it (Markdown to HTML) and
 * Turndown (HTML to Markdown), with the GFM rules written here.
 */

import {Component, onMounted, useRef, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {HtmlField} from "@web_editor/js/backend/html_field";
import {_t} from "@web/core/l10n/translation";
import {escape} from "@web/core/utils/strings";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

// Task marker at the start of a list item: "[ ] ", "[x] " or "[X] ".
const RE_TASK_MARKER = /^\[([ xX])\]\s+/;

/**
 * Markdown-it plugin that marks task list items.
 *
 * markdown-it has no task lists: "- [x] done" is an item whose text starts
 * with "[x] ". The marker is read from the Markdown source of the item, so
 * that an escaped "\[x\]" stays text; the item gets data-task (and
 * data-task-checked), and taskListsToOdoo removes the marker.
 *
 * @param {Object} md markdown-it instance
 */
export function taskItemsPlugin(md) {
    md.core.ruler.after("inline", "task_items", (state) => {
        const tokens = state.tokens;
        for (let i = 2; i < tokens.length; i++) {
            const match =
                tokens[i].type === "inline" &&
                tokens[i - 1].type === "paragraph_open" &&
                tokens[i - 2].type === "list_item_open" &&
                RE_TASK_MARKER.exec(tokens[i].content);
            if (match) {
                tokens[i - 2].attrSet("data-task", "");
                if (match[1] !== " ") {
                    tokens[i - 2].attrSet("data-task-checked", "");
                }
            }
        }
    });
}

/**
 * Remove the task marker at the start of the text of a list item.
 *
 * @param {HTMLElement} item list item marked by taskItemsPlugin
 */
function removeTaskMarker(item) {
    const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        // Reason: in a loose list, markdown-it puts a line break before the
        // paragraph of the item.
        if (!node.nodeValue.trim()) {
            continue;
        }
        const value = node.nodeValue.replace(/^\s+/, "");
        const match = RE_TASK_MARKER.exec(value);
        if (match) {
            node.nodeValue = value.slice(match[0].length);
        }
        return;
    }
}

/**
 * Turn the marked task lists into Odoo checklists.
 *
 * @param {HTMLElement} root element whose lists are converted in place
 */
function taskListsToOdoo(root) {
    const items = [...root.querySelectorAll("li[data-task]")];
    // Reason: an Odoo checklist turns every item into a checkbox; a list
    // mixing tasks and ordinary items stays an ordinary list.
    const taskLists = new Set(
        items
            .map((item) => item.parentElement)
            .filter(
                (list) =>
                    list &&
                    list.tagName === "UL" &&
                    [...list.children].every((li) => items.includes(li))
            )
    );
    for (const item of items) {
        const list = item.parentElement;
        if (taskLists.has(list)) {
            list.classList.add("o_checklist");
            removeTaskMarker(item);
            if (item.hasAttribute("data-task-checked")) {
                item.classList.add("o_checked");
            }
        }
        item.removeAttribute("data-task");
        item.removeAttribute("data-task-checked");
    }
}

/**
 * Add inline styles and Bootstrap classes so that the HTML renders in the
 * Odoo editor (and in e-mails) as in the preview of the dialog.
 *
 * @param {String} html HTML produced by markdown-it
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
    taskListsToOdoo(temp);
    return temp.innerHTML;
}

// Markdown-it parsers, with and without raw HTML (see markdownToHtml).
const markdownParsers = new Map();

/**
 * Markdown-it parser, created once per setting.
 *
 * @param {Boolean} allowHtml whether raw HTML of the Markdown is rendered
 * @returns {Object|null} parser, or null when markdown-it is not loaded
 */
function getMarkdownParser(allowHtml) {
    const markdownit = window.markdownit;
    if (!markdownit) {
        return null;
    }
    if (!markdownParsers.has(markdownit)) {
        markdownParsers.set(markdownit, {});
    }
    const parsers = markdownParsers.get(markdownit);
    if (!parsers[allowHtml]) {
        parsers[allowHtml] = markdownit({
            html: allowHtml,
            linkify: false,
            typographer: false,
            breaks: false,
        }).use(taskItemsPlugin);
    }
    return parsers[allowHtml];
}

/**
 * Convert Markdown to HTML with markdown-it.
 *
 * Raw HTML in the Markdown is rendered only when DOMPurify (loaded with the
 * Odoo editor) can sanitize it; otherwise it stays text. Without markdown-it,
 * the text is returned escaped in a paragraph.
 *
 * @param {String} markdown Markdown source
 * @returns {String} HTML ready to insert in an Odoo HTML field
 */
export function markdownToHtml(markdown) {
    if (!markdown || !markdown.trim()) {
        return "";
    }
    const purify = window.DOMPurify;
    const parser = getMarkdownParser(Boolean(purify));
    if (!parser) {
        console.error("markdown-it not loaded");
        return `<p>${escape(markdown)}</p>`;
    }
    try {
        let html = parser.render(markdown);
        if (purify) {
            html = purify.sanitize(html);
        }
        return makeHtmlOdooCompatible(html);
    } catch (e) {
        console.error("Error converting markdown:", e);
        return `<p>${escape(markdown)}</p>`;
    }
}

// Inline style properties that carry a color.
const COLOR_PROPERTIES = ["color", "background-color", "background"];
// Inline style properties lost by the conversion, other than colors.
const STYLE_PROPERTIES = [
    "font-size",
    "font-family",
    "text-align",
    "text-decoration",
    "text-decoration-line",
];
// Odoo color classes (text-o-color-1, bg-200, text-danger...).
const RE_COLOR_CLASS = /^(text|bg)-/;
// Attributes kept for the Markdown conversion (plus data-task*).
const KEPT_ATTRIBUTES = new Set([
    "href",
    "src",
    "alt",
    "title",
    "colspan",
    "rowspan",
    "start",
]);
// Zero-width characters added by the Odoo editor (around links, in empty lines).
const RE_ZWS = /[\u200B\uFEFF]/g;

/**
 * Text of an HTML string, used when Turndown is missing.
 *
 * @param {String} html
 * @returns {String}
 */
function htmlToText(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent.replace(RE_ZWS, "").trim();
}

/**
 * Prepare HTML of the Odoo editor for the Turndown converter.
 *
 * Odoo checklists get data-task markers; styles, color classes and the
 * editor's technical attributes are dropped; span and font wrappers are
 * unwrapped, so that no raw HTML is left in the Markdown.
 *
 * @param {String} html HTML of an Odoo field
 * @returns {String} simplified HTML
 */
export function normalizeOdooHtml(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html || "";
    for (const list of temp.querySelectorAll("ul.o_checklist")) {
        for (const item of list.children) {
            if (item.tagName !== "LI") {
                continue;
            }
            item.setAttribute("data-task", "");
            if (item.classList.contains("o_checked")) {
                item.setAttribute("data-task-checked", "");
            }
        }
    }
    for (const el of temp.querySelectorAll("*")) {
        // Reason: Turndown reads the language of a code block from its
        // language-* class.
        const language =
            el.tagName === "CODE" &&
            [...el.classList].find((cls) => cls.startsWith("language-"));
        for (const attr of [...el.attributes]) {
            if (!KEPT_ATTRIBUTES.has(attr.name) && !attr.name.startsWith("data-task")) {
                el.removeAttribute(attr.name);
            }
        }
        if (language) {
            el.className = language;
        }
    }
    for (const wrapper of [...temp.querySelectorAll("span, font")]) {
        wrapper.replaceWith(...wrapper.childNodes);
    }
    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        node.nodeValue = node.nodeValue.replace(RE_ZWS, "");
    }
    return temp.innerHTML;
}

/**
 * Text of a table cell for a GFM table: one line, pipes escaped.
 *
 * @param {String} content Markdown of the cell, from Turndown
 * @returns {String}
 */
function tableCellText(content) {
    return content.trim().replace(/\n+/g, "<br>").replace(/\|/g, "\\|");
}

/**
 * Add the GFM rules to a Turndown service: tables, strikethrough and task
 * lists (Odoo checklists marked by normalizeOdooHtml), and compact list
 * markers.
 *
 * @param {Object} service TurndownService instance
 */
export function addGfmRules(service) {
    service.addRule("strikethrough", {
        filter: ["del", "s", "strike"],
        replacement: (content) => `~~${content}~~`,
    });
    service.addRule("listItem", {
        filter: "li",
        replacement: (content, node, options) => {
            // Reason: Turndown writes "-   item" and "1.  item"; one space
            // after the marker is the usual style, and nested content is
            // indented to the start of the item text.
            let marker = options.bulletListMarker;
            const parent = node.parentNode;
            if (parent && parent.nodeName === "OL") {
                const start = Number.parseInt(parent.getAttribute("start"), 10);
                const first = Number.isInteger(start) ? start : 1;
                marker = `${first + [...parent.children].indexOf(node)}.`;
            }
            const indent = " ".repeat(marker.length + 1);
            let task = "";
            if (node.hasAttribute("data-task")) {
                task = node.hasAttribute("data-task-checked") ? "[x] " : "[ ] ";
            }
            const isParagraph = /\n$/.test(content);
            const text = (
                content.replace(/^\n+|\n+$/g, "") + (isParagraph ? "\n" : "")
            ).replace(/\n/gm, `\n${indent}`);
            const next = node.nextSibling ? "\n" : "";
            return `${marker} ${task}${text}${next}`;
        },
    });
    service.addRule("preformatted", {
        // Reason: the code block of the Odoo editor is a pre without code
        // element, which Turndown would write as plain text.
        filter: (node) =>
            node.nodeName === "PRE" &&
            !(node.firstChild && node.firstChild.nodeName === "CODE"),
        replacement: (content, node) => {
            const clone = node.cloneNode(true);
            for (const br of clone.querySelectorAll("br")) {
                br.replaceWith("\n");
            }
            const text = clone.textContent.replace(/\n$/, "");
            const runs = (text.match(/^ {0,3}`{3,}/gm) || []).map(
                (run) => run.trim().length + 1
            );
            const fence = "`".repeat(Math.max(3, ...runs));
            return `\n\n${fence}\n${text}\n${fence}\n\n`;
        },
    });
    service.addRule("tableCell", {
        filter: ["th", "td"],
        replacement: (content) => ` ${tableCellText(content)} |`,
    });
    service.addRule("tableRow", {
        filter: "tr",
        replacement: (content, node) => {
            let row = `|${content}\n`;
            // Reason: GFM needs a header row; the first row of the table is
            // the header, whether its cells are th or td (Odoo tables often
            // have no th).
            const table = node.closest("table");
            if (table && table.rows[0] === node) {
                const separator = [...node.cells].map(() => " --- |").join("");
                row += `|${separator}\n`;
            }
            return row;
        },
    });
    service.addRule("tableSection", {
        filter: ["thead", "tbody", "tfoot"],
        replacement: (content) => content,
    });
    service.addRule("table", {
        filter: "table",
        replacement: (content) => `\n\n${content.trim()}\n\n`,
    });
}

// Turndown services, one per loaded library.
const turndownServices = new Map();

/**
 * Turndown service with the module's options and GFM rules, created once.
 *
 * @returns {Object|null} service, or null when Turndown is not loaded
 */
function getTurndownService() {
    const TurndownService = window.TurndownService;
    if (!TurndownService) {
        return null;
    }
    if (!turndownServices.has(TurndownService)) {
        const service = new TurndownService({
            headingStyle: "atx",
            hr: "---",
            bulletListMarker: "-",
            codeBlockStyle: "fenced",
            fence: "```",
            emDelimiter: "*",
            strongDelimiter: "**",
            linkStyle: "inlined",
        });
        addGfmRules(service);
        const escapeMarkdown = service.escape.bind(service);
        // Reason: Turndown does not escape what markdown-it would read back
        // as strikethrough (~~), raw HTML (<tag) or an entity (&name;).
        service.escape = (text) =>
            escapeMarkdown(text)
                .replace(/~{2,}/g, (run) => run.replace(/~/g, "\\~"))
                .replace(/<(?=[A-Za-z/!?])/g, "\\<")
                .replace(/&(?=#?\w+;)/g, "\\&");
        turndownServices.set(TurndownService, service);
    }
    return turndownServices.get(TurndownService);
}

/**
 * Convert HTML to Markdown with Turndown.
 *
 * Without Turndown, the text of the HTML is returned.
 *
 * @param {String} html HTML of an Odoo field or of a selection
 * @returns {String} Markdown
 */
export function htmlToMarkdown(html) {
    if (!html || !html.trim()) {
        return "";
    }
    const service = getTurndownService();
    if (!service) {
        console.error("Turndown not loaded");
        return htmlToText(html);
    }
    try {
        return service.turndown(normalizeOdooHtml(html)).replace(RE_ZWS, "").trim();
    } catch (e) {
        console.error("Error converting HTML to Markdown:", e);
        return htmlToText(html);
    }
}

/**
 * List the kinds of formatting that the Markdown conversion loses.
 *
 * @param {String} html HTML of an Odoo field or of a selection
 * @returns {String[]} among "colors", "styles", "merged_cells", in this order
 */
export function detectLostFormatting(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html || "";
    let colors = Boolean(temp.querySelector("font[color], font[class*='-']"));
    let styles = Boolean(temp.querySelector("u"));
    for (const el of temp.querySelectorAll("[style], [class]")) {
        if ([...el.classList].some((cls) => RE_COLOR_CLASS.test(cls))) {
            colors = true;
        }
        if (!el.style) {
            continue;
        }
        for (const prop of COLOR_PROPERTIES) {
            // Reason: makeHtmlOdooCompatible colors th, pre, code and
            // blockquote; those come back from Markdown and are not a loss.
            if (
                el.style.getPropertyValue(prop) &&
                !el.matches("th, pre, code, blockquote")
            ) {
                colors = true;
            }
        }
        // Reason: makeHtmlOdooCompatible shrinks inline code (font-size 85%).
        if (
            STYLE_PROPERTIES.some((prop) => el.style.getPropertyValue(prop)) &&
            !el.matches("code")
        ) {
            styles = true;
        }
    }
    const merged = [...temp.querySelectorAll("[colspan], [rowspan]")].some(
        (cell) => Number(cell.colSpan) > 1 || Number(cell.rowSpan) > 1
    );
    const lost = [];
    if (colors) {
        lost.push("colors");
    }
    if (styles) {
        lost.push("styles");
    }
    if (merged) {
        lost.push("merged_cells");
    }
    return lost;
}

// Markdown image: ![alt](src "title").
const RE_MD_IMAGE = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g;
// Fenced code blocks and inline code spans, kept as written.
const RE_MD_CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/;
// Src attribute of a raw <img> tag left in the Markdown.
const RE_HTML_IMG_SRC = /(<img\b[^>]*\bsrc=")([^"]+)(")/g;

/**
 * Prepare Markdown for use outside Odoo.
 *
 * Image paths of this server become full addresses; embedded (data:) images
 * are replaced by their text, so that the clipboard stays readable.
 *
 * @param {String} markdown Markdown of the dialog
 * @param {String} origin scheme and host of the server, e.g. https://erp.x
 * @returns {String} Markdown to copy
 */
export function prepareMarkdownForCopy(markdown, origin) {
    const absolute = (src) =>
        src.startsWith("/") && !src.startsWith("//") ? origin + src : src;
    const embeddedLabel = _t("embedded image");
    const defaultAlt = _t("image");
    const prepare = (text) =>
        text
            .replace(RE_MD_IMAGE, (match, alt, src, title) => {
                if (src.startsWith("data:")) {
                    return `${alt || defaultAlt} (${embeddedLabel})`;
                }
                return `![${alt}](${absolute(src)}${title || ""})`;
            })
            .replace(
                RE_HTML_IMG_SRC,
                (match, before, src, after) => before + absolute(src) + after
            );
    // Reason: image syntax shown as an example in code stays as written; the
    // odd parts of the split are code blocks and code spans.
    return markdown
        .split(RE_MD_CODE)
        .map((part, index) => (index % 2 ? part : prepare(part)))
        .join("");
}

/**
 * HTML of a selection, with the elements around it.
 *
 * Range.cloneContents() leaves out the ancestors of a selection made inside a
 * link, a bold text or a heading; they are cloned around the fragment so that
 * the conversion keeps the link address and the formatting.
 *
 * @param {Range} range selection inside the editable
 * @param {HTMLElement} root editable element of the field
 * @returns {String} HTML of the selection
 */
export function selectionToHtml(range, root) {
    let content = range.cloneContents();
    let node = range.commonAncestorContainer;
    if (node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentElement;
    }
    while (node && node !== root && root.contains(node)) {
        const wrapper = node.cloneNode(false);
        wrapper.appendChild(content);
        content = wrapper;
        node = node.parentElement;
    }
    const container = document.createElement("div");
    container.appendChild(content);
    return container.innerHTML;
}

/**
 * Copy text to the clipboard.
 *
 * Uses the Clipboard API on a secure page, else a hidden textarea and
 * document.execCommand("copy") (plain http, e.g. a local server).
 *
 * @param {String} text text to copy
 * @param {HTMLElement} container element that holds the hidden textarea, inside
 *   the dialog so that its focus handling does not interfere
 * @returns {Promise<Boolean>} whether the text was copied
 */
export async function copyToClipboard(text, container = document.body) {
    if (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            console.warn("Clipboard API refused the copy:", e);
        }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    container.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
        copied = document.execCommand("copy");
    } catch (e) {
        copied = false;
    } finally {
        textarea.remove();
    }
    return copied;
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
 * Dialog with Markdown on the left and its HTML preview on the right.
 *
 * Mode "paste": the user pastes Markdown and inserts the converted HTML.
 * Mode "export": the dialog opens with the content converted to Markdown; the
 * user copies it, or edits it and replaces the content.
 */
export class PasteMarkdownDialog extends Component {
    setup() {
        this.notification = useService("notification");
        this.state = useState({
            markdownContent: this.props.initialMarkdown || "",
            showLossWarning: false,
        });
        this.rootRef = useRef("root");
        this.textareaRef = useRef("markdownTextarea");
        this.previewRef = useRef("htmlPreview");
        this.lostFormatting = detectLostFormatting(this.props.sourceHtml || "");
        onMounted(() => {
            this._updatePreview();
            if (this.textareaRef.el) {
                this.textareaRef.el.focus();
            }
        });
    }

    get isExport() {
        return this.props.mode === "export";
    }

    get title() {
        return this.isExport ? _t("To Markdown") : _t("Paste Markdown");
    }

    /**
     * Labels of the formatting lost by a replacement, for the warning.
     *
     * @returns {String}
     */
    get lostFormattingLabel() {
        const labels = {
            colors: _t("colors"),
            styles: _t("styles"),
            merged_cells: _t("merged cells"),
        };
        return this.lostFormatting.map((kind) => labels[kind]).join(", ");
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

    async onCopy() {
        const markdown = prepareMarkdownForCopy(
            this.state.markdownContent,
            window.location.origin
        );
        const copied = await copyToClipboard(markdown, this.rootRef.el || undefined);
        if (copied) {
            this.notification.add(_t("Markdown copied to the clipboard."), {
                type: "success",
            });
        } else {
            this.notification.add(
                _t("The clipboard is not available: select the text and copy it."),
                {type: "warning"}
            );
        }
    }

    onReplace() {
        // Reason: while the warning is shown, only its own button replaces, so
        // that a double click on Replace cannot skip it.
        if (this.state.showLossWarning) {
            return;
        }
        if (this.lostFormatting.length) {
            this.state.showLossWarning = true;
            return;
        }
        this.onReplaceConfirm();
    }

    onReplaceConfirm() {
        // Reason: an empty Markdown empties the selection or the field; the
        // editor needs a paragraph to keep a caret.
        const html = markdownToHtml(this.state.markdownContent) || "<p><br></p>";
        this.props.close();
        this.props.onConfirm(html);
    }

    onReplaceCancel() {
        this.state.showLossWarning = false;
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
    mode: {type: String, optional: true},
    initialMarkdown: {type: String, optional: true},
    sourceHtml: {type: String, optional: true},
};
PasteMarkdownDialog.defaultProps = {
    mode: "paste",
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
        const toMarkdownCommand = {
            category: this.env._t("Basic blocks"),
            name: this.env._t("To Markdown"),
            priority: 49,
            description: this.env._t("Get the content as Markdown"),
            fontawesome: "fa-file-text-o",
            callback: () => this._openToMarkdownDialog(false),
        };
        options.powerboxCommands = [
            ...(options.powerboxCommands || []),
            pasteMarkdownCommand,
            toMarkdownCommand,
        ];
        return options;
    },

    async startWysiwyg() {
        await this._super(...arguments);
        this._addToMarkdownToolbarButton();
    },

    /**
     * Add a "To Markdown" button to the floating toolbar, shown when text is
     * selected, for the selection.
     */
    _addToMarkdownToolbarButton() {
        const toolbarEl =
            this.wysiwyg && this.wysiwyg.toolbar && this.wysiwyg.toolbar.el;
        if (!toolbarEl || toolbarEl.querySelector("#to-markdown")) {
            return;
        }
        const group = document.createElement("div");
        group.id = "to-markdown-btn-group";
        group.className = "btn-group";
        const button = document.createElement("div");
        button.id = "to-markdown";
        button.className = "btn fa fa-file-text-o fa-fw editor-ignore";
        button.title = this.env._t("To Markdown");
        // Reason: a mousedown on the toolbar would move the caret and lose the
        // selection that the button converts.
        button.addEventListener("mousedown", (ev) => ev.preventDefault());
        button.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this._openToMarkdownDialog(true);
        });
        group.appendChild(button);
        toolbarEl.appendChild(group);
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

    /**
     * Open the dialog with the content converted to Markdown.
     *
     * @param {Boolean} useSelection convert the selection (toolbar button)
     *   rather than the whole field (powerbox); without a selection the whole
     *   field is used
     */
    _openToMarkdownDialog(useSelection) {
        if (!this.wysiwyg || !this.wysiwyg.odooEditor) {
            return;
        }
        const editor = this.wysiwyg.odooEditor;
        const selection = editor.document.getSelection();
        let range = null;
        let html = "";
        if (
            useSelection &&
            selection.rangeCount &&
            !selection.isCollapsed &&
            editor.editable.contains(selection.getRangeAt(0).commonAncestorContainer)
        ) {
            range = selection.getRangeAt(0).cloneRange();
            html = selectionToHtml(range, editor.editable);
        } else {
            html = editor.editable.innerHTML;
        }
        this.dialogService.add(PasteMarkdownDialog, {
            mode: "export",
            initialMarkdown: htmlToMarkdown(html),
            sourceHtml: html,
            onConfirm: (newHtml) => this._replaceWithHtml(newHtml, range),
        });
    },

    /**
     * Replace the saved selection, or the whole field, with HTML.
     *
     * @param {String} html HTML converted from the edited Markdown
     * @param {Range|null} range selection saved when the dialog opened
     */
    _replaceWithHtml(html, range) {
        if (!this.wysiwyg || !this.wysiwyg.odooEditor) {
            return;
        }
        const editor = this.wysiwyg.odooEditor;
        this.wysiwyg.focus();
        // Reason: as for Paste Markdown, the editor gets its focus back only
        // once the dialog is closed.
        setTimeout(() => {
            try {
                const selection = editor.document.getSelection();
                let target = range;
                if (!target) {
                    // Reason: the whole field is replaced as a selection of all
                    // its content; Odoo 16 cannot undo a reset of the editable
                    // (resetContent, innerHTML): Ctrl+Z put the blocks back in
                    // reverse order.
                    target = editor.document.createRange();
                    target.selectNodeContents(editor.editable);
                }
                selection.removeAllRanges();
                selection.addRange(target);
                editor.execCommand("insert", parseHtmlToFragment(html));
                editor.historyStep();
            } catch (e) {
                console.error("Markdown replacement failed:", e);
            }
        }, 100);
    },
});
