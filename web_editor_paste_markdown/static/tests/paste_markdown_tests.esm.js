/** @odoo-module **/
/* Copyright 2026 Yves Goldberg (Ygol InternetWork)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
/* global QUnit */

import {markdownToHtml} from "@web_editor_paste_markdown/js/paste_markdown.esm";
import {patchWithCleanup} from "@web/../tests/helpers/utils";

/**
 * Parse an HTML string into a detached element.
 *
 * @param {String} html
 * @returns {HTMLElement}
 */
function parse(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div;
}

QUnit.module("web_editor_paste_markdown", () => {
    QUnit.test("empty markdown gives an empty string", (assert) => {
        assert.strictEqual(markdownToHtml(""), "");
        assert.strictEqual(markdownToHtml("   \n "), "");
    });

    QUnit.test("headings, lists and emphasis are converted", (assert) => {
        const el = parse(markdownToHtml("# Title\n\n- one\n- **two**"));
        assert.strictEqual(el.querySelector("h1").textContent, "Title");
        assert.strictEqual(el.querySelectorAll("ul > li").length, 2);
        assert.strictEqual(el.querySelector("strong").textContent, "two");
    });

    QUnit.test("tables get the Odoo editor classes and inline styles", (assert) => {
        const el = parse(markdownToHtml("| a | b |\n|---|---|\n| 1 | 2 |"));
        const table = el.querySelector("table");
        assert.ok(table.classList.contains("table"));
        assert.ok(table.classList.contains("table-bordered"));
        assert.ok(table.classList.contains("o_table"));
        assert.strictEqual(table.style.borderCollapse, "collapse");
        assert.strictEqual(el.querySelector("th").style.fontWeight, "600");
        assert.ok(el.querySelector("td").style.border);
    });

    QUnit.test("inline code is styled, block code only on pre", (assert) => {
        const el = parse(markdownToHtml("Use `x`\n\n```\nblock\n```"));
        const inline = el.querySelector("p code");
        assert.ok(inline.style.backgroundColor, "inline code is styled");
        const pre = el.querySelector("pre");
        assert.ok(pre.style.backgroundColor, "the pre block is styled");
        assert.notOk(
            pre.querySelector("code").style.backgroundColor,
            "code inside pre keeps the pre style"
        );
    });

    QUnit.test("fallback without Toast UI escapes the text", (assert) => {
        patchWithCleanup(window, {toastui: undefined});
        // Reason: the missing library is logged as an error, which the test
        // runner would report as a failure of this expected situation.
        patchWithCleanup(console, {error: () => undefined});
        const html = markdownToHtml("<script>alert(1)</script>");
        assert.strictEqual(html, "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
    });
});
