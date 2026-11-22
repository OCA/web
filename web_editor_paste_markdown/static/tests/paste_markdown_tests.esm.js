/** @odoo-module **/
/* Copyright 2026 Yves Goldberg (Ygol InternetWork)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
/* global QUnit */

import {
    PasteMarkdownDialog,
    detectLostFormatting,
    htmlToMarkdown,
    markdownToHtml,
    prepareMarkdownForCopy,
    selectionToHtml,
} from "@web_editor_paste_markdown/js/paste_markdown.esm";
import {
    click,
    editInput,
    getFixture,
    mount,
    patchWithCleanup,
} from "@web/../tests/helpers/utils";
import {hotkeyService} from "@web/core/hotkeys/hotkey_service";
import {makeTestEnv} from "@web/../tests/helpers/mock_env";
import {notificationService} from "@web/core/notifications/notification_service";
import {registry} from "@web/core/registry";
import {uiService} from "@web/core/ui/ui_service";

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

    QUnit.test("conversions do not need Toast UI", (assert) => {
        // Reason: web_widget_markdown_editor may be installed and load Toast
        // UI; the module must work without it.
        patchWithCleanup(window, {toastui: undefined});
        assert.ok(markdownToHtml("**b**").includes("<strong>b</strong>"));
        assert.strictEqual(htmlToMarkdown("<p><strong>b</strong></p>"), "**b**");
    });

    QUnit.test("fallback without the library escapes the text", (assert) => {
        patchWithCleanup(window, {markdownit: undefined});
        // Reason: the missing library is logged as an error, which the test
        // runner would report as a failure of this expected situation.
        patchWithCleanup(console, {error: () => undefined});
        const html = markdownToHtml("<script>alert(1)</script>");
        assert.strictEqual(html, "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
    });
});

QUnit.module("web_editor_paste_markdown: raw HTML", () => {
    QUnit.test("raw HTML is sanitized by DOMPurify", (assert) => {
        const sanitized = [];
        patchWithCleanup(window, {
            DOMPurify: {
                sanitize: (html) => {
                    sanitized.push(html);
                    return html.replace(/<script>.*?<\/script>/g, "");
                },
            },
        });
        const html = markdownToHtml("a<br>b\n\n<script>alert(1)</script>");
        assert.strictEqual(sanitized.length, 1);
        assert.ok(html.includes("<br>"), html);
        assert.notOk(html.includes("script"), html);
    });

    QUnit.test("without DOMPurify raw HTML stays text", (assert) => {
        patchWithCleanup(window, {DOMPurify: undefined});
        const html = markdownToHtml("<script>alert(1)</script>");
        assert.notOk(parse(html).querySelector("script"), html);
        assert.ok(html.includes("&lt;script&gt;"), html);
    });
});

QUnit.module("web_editor_paste_markdown: checklists", () => {
    QUnit.test("Markdown task lists become Odoo checklists", (assert) => {
        const el = parse(markdownToHtml("- [ ] todo\n- [x] done"));
        const list = el.querySelector("ul");
        assert.ok(list.classList.contains("o_checklist"));
        const items = list.querySelectorAll("li");
        assert.strictEqual(items.length, 2);
        assert.notOk(items[0].classList.contains("o_checked"));
        assert.ok(items[1].classList.contains("o_checked"));
        assert.notOk(items[1].hasAttribute("data-task"), "task markers removed");
        assert.strictEqual(items[1].textContent.trim(), "done", "marker removed");
    });

    QUnit.test("a list mixing tasks and items stays an ordinary list", (assert) => {
        const el = parse(markdownToHtml("- plain\n- [x] task"));
        const list = el.querySelector("ul");
        assert.notOk(list.classList.contains("o_checklist"));
        assert.strictEqual(el.querySelectorAll("li.o_checked").length, 0);
        assert.strictEqual(el.querySelectorAll("li[data-task]").length, 0);
    });

    QUnit.test("tasks of a loose list become a checklist", (assert) => {
        const el = parse(markdownToHtml("- [ ] todo\n\n- [x] done"));
        assert.ok(el.querySelector("ul").classList.contains("o_checklist"));
        assert.strictEqual(el.querySelectorAll("li.o_checked").length, 1);
        assert.notOk(el.textContent.includes("[x]"), el.innerHTML);
    });

    QUnit.test("a mixed list keeps its task markers as text", (assert) => {
        const el = parse(markdownToHtml("- [x] done\n- ordinary"));
        assert.ok(el.querySelector("li").textContent.startsWith("[x] done"));
    });

    QUnit.test("an escaped task marker stays text", (assert) => {
        const el = parse(markdownToHtml("- \\[x\\] label\n- \\[ \\] other"));
        assert.notOk(el.querySelector("ul").classList.contains("o_checklist"));
        assert.ok(el.querySelector("li").textContent.startsWith("[x] label"));
    });

    QUnit.test("checklists survive a round trip", (assert) => {
        const html = markdownToHtml("- [ ] todo\n- [x] done");
        const md = htmlToMarkdown(html);
        assert.strictEqual(md, "- [ ] todo\n- [x] done");
    });
});

QUnit.module("web_editor_paste_markdown: htmlToMarkdown", () => {
    QUnit.test("empty HTML gives an empty string", (assert) => {
        assert.strictEqual(htmlToMarkdown(""), "");
        assert.strictEqual(htmlToMarkdown("  "), "");
    });

    QUnit.test("headings, emphasis, lists and links are converted", (assert) => {
        const md = htmlToMarkdown(
            "<h1>Title</h1><p><strong>bold</strong> and <em>it</em></p>" +
                "<ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>" +
                '<p><a href="https://example.com">link</a></p>'
        );
        assert.ok(md.includes("# Title"), md);
        assert.ok(md.includes("**bold**"), md);
        assert.ok(md.includes("*it*"), md);
        assert.ok(/^[-*] one$/m.test(md), md);
        assert.ok(/^1\. first$/m.test(md), md);
        assert.ok(md.includes("[link](https://example.com)"), md);
    });

    QUnit.test("tables, code and quotes are converted", (assert) => {
        const md = htmlToMarkdown(
            "<table><thead><tr><th>a</th><th>b</th></tr></thead>" +
                "<tbody><tr><td>1</td><td>2</td></tr></tbody></table>" +
                "<p>use <code>x</code></p><pre><code>block</code></pre>" +
                "<blockquote><p>quoted</p></blockquote>"
        );
        assert.ok(/\|\s*a\s*\|\s*b\s*\|/.test(md), md);
        assert.ok(/\|\s*1\s*\|\s*2\s*\|/.test(md), md);
        assert.ok(md.includes("`x`"), md);
        assert.ok(md.includes("```"), md);
        assert.ok(md.includes("> quoted"), md);
    });

    QUnit.test("paragraphs are separated by a blank line", (assert) => {
        assert.strictEqual(htmlToMarkdown("<p>one</p><p>two</p>"), "one\n\ntwo");
        assert.strictEqual(htmlToMarkdown("loose <b>text</b>"), "loose **text**");
    });

    QUnit.test("zero-width characters of the Odoo editor are dropped", (assert) => {
        const md = htmlToMarkdown(
            '<p>see \uFEFF<a href="https://x.org">\uFEFFlink\uFEFF</a>\uFEFF.\u200B</p>'
        );
        assert.strictEqual(md, "see [link](https://x.org).");
    });

    QUnit.test("Odoo checklists become Markdown task lists", (assert) => {
        const md = htmlToMarkdown(
            '<ul class="o_checklist"><li>todo</li><li class="o_checked">done</li></ul>'
        );
        assert.ok(/\[ \] todo/.test(md), md);
        assert.ok(/\[x\] done/.test(md), md);
    });

    QUnit.test("colors and font sizes are dropped, text is kept", (assert) => {
        const md = htmlToMarkdown(
            '<p><span style="color: red; font-size: 16px;">red text</span>' +
                ' <font class="text-o-color-1">blue</font></p>'
        );
        assert.ok(md.includes("red text"), md);
        assert.ok(md.includes("blue"), md);
        assert.notOk(md.includes("style"), md);
        assert.notOk(md.includes("<"), md);
    });

    QUnit.test("images keep their original path", (assert) => {
        const md = htmlToMarkdown(
            '<p><img class="img-fluid" src="/web/image/12-ab/x.png" alt="schema"></p>'
        );
        assert.ok(md.includes("![schema](/web/image/12-ab/x.png)"), md);
    });

    QUnit.test("round trip keeps the structure", (assert) => {
        const html = markdownToHtml(
            "# T\n\n- a\n- b\n\n| h | i |\n| --- | --- |\n| 1 | 2 |"
        );
        const el = parse(markdownToHtml(htmlToMarkdown(html)));
        assert.strictEqual(el.querySelector("h1").textContent, "T");
        assert.strictEqual(el.querySelectorAll("ul > li").length, 2);
        assert.strictEqual(el.querySelectorAll("td").length, 2);
    });

    QUnit.test("tables without header cells get a header row", (assert) => {
        const md = htmlToMarkdown(
            "<table><tbody><tr><td>a</td><td>b</td></tr>" +
                "<tr><td>1</td><td>x | y</td></tr></tbody></table>"
        );
        assert.strictEqual(md, "| a | b |\n| --- | --- |\n| 1 | x \\| y |");
    });

    QUnit.test("line breaks in a table cell become <br>", (assert) => {
        const md = htmlToMarkdown(
            "<table><tr><th>h</th></tr><tr><td><p>l1</p><p>l2</p></td></tr></table>"
        );
        assert.ok(md.includes("| l1<br>l2 |"), md);
    });

    QUnit.test("the language of a code block is kept", (assert) => {
        const html = markdownToHtml("```python\nx = 1\n```");
        assert.strictEqual(htmlToMarkdown(html), "```python\nx = 1\n```");
    });

    QUnit.test("the start of an ordered list is kept", (assert) => {
        assert.strictEqual(
            htmlToMarkdown('<ol start="0"><li>a</li><li>b</li></ol>'),
            "0. a\n1. b"
        );
        assert.strictEqual(htmlToMarkdown('<ol start="3"><li>c</li></ol>'), "3. c");
    });

    QUnit.test("a code block of the Odoo editor is fenced", (assert) => {
        assert.strictEqual(
            htmlToMarkdown("<pre>one<br>  two</pre>"),
            "```\none\n  two\n```"
        );
        assert.strictEqual(
            htmlToMarkdown("<pre>```\nx\n```</pre>"),
            "````\n```\nx\n```\n````"
        );
    });

    QUnit.test("literal tildes, tags and entities stay text", (assert) => {
        const html = "<p>~~not struck~~ &lt;br&gt; &amp;copy; ~5 min</p>";
        const md = htmlToMarkdown(html);
        assert.ok(md.includes("~5 min"), md);
        const back = parse(markdownToHtml(md));
        assert.notOk(back.querySelector("s, br"), back.innerHTML);
        assert.strictEqual(
            back.textContent.trim(),
            "~~not struck~~ <br> &copy; ~5 min"
        );
    });

    QUnit.test("strikethrough is converted both ways", (assert) => {
        assert.strictEqual(
            htmlToMarkdown("<p><s>old</s> <del>x</del></p>"),
            "~~old~~ ~~x~~"
        );
        assert.ok(markdownToHtml("~~old~~").includes("<s>old</s>"));
    });

    QUnit.test("nested lists survive a round trip", (assert) => {
        const html = "<ul><li>a<ul><li>a1</li></ul></li><li>b</li></ul>";
        const el = parse(markdownToHtml(htmlToMarkdown(html)));
        assert.strictEqual(el.querySelectorAll("ul ul > li").length, 1);
        assert.strictEqual(el.querySelectorAll("ul > li").length, 3);
    });

    QUnit.test("fallback without the library gives the text", (assert) => {
        patchWithCleanup(window, {TurndownService: undefined});
        patchWithCleanup(console, {error: () => undefined});
        assert.strictEqual(htmlToMarkdown("<p>plain <b>text</b></p>"), "plain text");
    });
});

QUnit.module("web_editor_paste_markdown: selectionToHtml", () => {
    QUnit.test("a selection inside a link keeps the link", (assert) => {
        const root = parse('<p>see <a href="https://x.org">the <b>link</b></a></p>');
        const range = document.createRange();
        range.selectNodeContents(root.querySelector("a"));
        const html = selectionToHtml(range, root);
        assert.strictEqual(html, '<p><a href="https://x.org">the <b>link</b></a></p>');
        assert.ok(htmlToMarkdown(html).includes("(https://x.org)"));
    });

    QUnit.test("a selection over several blocks is taken as is", (assert) => {
        const root = parse("<h2>T</h2><p>a</p>");
        const range = document.createRange();
        range.selectNodeContents(root);
        assert.strictEqual(selectionToHtml(range, root), "<h2>T</h2><p>a</p>");
    });
});

QUnit.module("web_editor_paste_markdown: detectLostFormatting", () => {
    QUnit.test("colors, styles and merged cells are detected", (assert) => {
        assert.deepEqual(
            detectLostFormatting('<p><span style="color: red">x</span></p>'),
            ["colors"]
        );
        assert.deepEqual(detectLostFormatting('<p class="bg-o-color-2">x</p>'), [
            "colors",
        ]);
        assert.deepEqual(
            detectLostFormatting('<p><span style="font-size: 18px">x</span></p>'),
            ["styles"]
        );
        assert.deepEqual(
            detectLostFormatting(
                '<table><tr><td colspan="2">x</td></tr></table><p><u>u</u></p>'
            ),
            ["styles", "merged_cells"]
        );
    });

    QUnit.test("HTML made from Markdown loses nothing", (assert) => {
        const html = markdownToHtml(
            "# T\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n> q\n\n`c`\n\n```\nb\n```"
        );
        assert.deepEqual(detectLostFormatting(html), []);
    });
});

QUnit.module("web_editor_paste_markdown: prepareMarkdownForCopy", () => {
    const origin = "https://erp.example.com";

    QUnit.test("relative image paths become full addresses", (assert) => {
        assert.strictEqual(
            prepareMarkdownForCopy("![s](/web/image/1-a/x.png) text", origin),
            "![s](https://erp.example.com/web/image/1-a/x.png) text"
        );
        assert.strictEqual(
            prepareMarkdownForCopy('<img src="/web/image/2" alt="y">', origin),
            '<img src="https://erp.example.com/web/image/2" alt="y">'
        );
    });

    QUnit.test("absolute addresses and links are kept", (assert) => {
        const md = "![s](https://cdn.example.com/x.png) [l](/odoo/path)";
        assert.strictEqual(prepareMarkdownForCopy(md, origin), md);
    });

    QUnit.test("image syntax inside code is kept", (assert) => {
        const code =
            "`![a](/web/image/1)` and\n\n```\n![b](data:image/png;base64,AA)\n```\n";
        assert.strictEqual(
            prepareMarkdownForCopy(code + "![c](/web/image/2)", origin),
            code + "![c](https://erp.example.com/web/image/2)"
        );
    });

    QUnit.test("embedded images are replaced by their text", (assert) => {
        assert.strictEqual(
            prepareMarkdownForCopy(
                "a ![chart](data:image/png;base64,iVBORw0K=) b",
                origin
            ),
            "a chart (embedded image) b"
        );
        assert.strictEqual(
            prepareMarkdownForCopy("![](data:image/png;base64,AAAA)", origin),
            "image (embedded image)"
        );
    });
});

QUnit.module("web_editor_paste_markdown: dialog", (hooks) => {
    let target = null;
    let env = null;

    hooks.beforeEach(async () => {
        target = getFixture();
        const services = registry.category("services");
        services.add("hotkey", hotkeyService, {force: true});
        services.add("ui", uiService, {force: true});
        services.add("notification", notificationService, {force: true});
        env = await makeTestEnv();
        env.dialogData = {isActive: true, close: () => undefined};
    });

    /**
     * Mount the dialog with the given props.
     *
     * @param {Object} props
     * @returns {Promise<Component>}
     */
    function mountDialog(props) {
        return mount(PasteMarkdownDialog, target, {
            env,
            props: {close: () => undefined, onConfirm: () => undefined, ...props},
        });
    }

    QUnit.test("export mode shows the Markdown and its preview", async (assert) => {
        await mountDialog({mode: "export", initialMarkdown: "# Hello"});
        assert.strictEqual(
            target.querySelector(".o_paste_markdown_textarea").value,
            "# Hello"
        );
        assert.strictEqual(
            target.querySelector(".o_paste_markdown_preview h1").textContent,
            "Hello"
        );
        assert.containsOnce(target, ".o_to_markdown_copy");
        assert.containsOnce(target, ".o_to_markdown_replace");
        assert.containsNone(target, ".o_paste_markdown_insert");
    });

    QUnit.test("copy puts the prepared Markdown in the clipboard", async (assert) => {
        const copied = [];
        patchWithCleanup(window, {isSecureContext: true});
        patchWithCleanup(navigator, {
            clipboard: {writeText: async (text) => copied.push(text)},
        });
        await mountDialog({
            mode: "export",
            initialMarkdown: "![i](data:image/png;base64,AA)",
        });
        await click(target, ".o_to_markdown_copy");
        assert.deepEqual(copied, ["i (embedded image)"]);
    });

    QUnit.test("replace sends the HTML of the edited Markdown", async (assert) => {
        const sent = [];
        await mountDialog({
            mode: "export",
            initialMarkdown: "old",
            sourceHtml: "<p>old</p>",
            onConfirm: (html) => sent.push(html),
        });
        await editInput(target, ".o_paste_markdown_textarea", "**new**");
        await click(target, ".o_to_markdown_replace");
        assert.strictEqual(sent.length, 1);
        assert.ok(sent[0].includes("<strong>new</strong>"), sent[0]);
    });

    QUnit.test("replace warns first when formatting is lost", async (assert) => {
        const sent = [];
        await mountDialog({
            mode: "export",
            initialMarkdown: "x",
            sourceHtml: '<p><span style="color: red">x</span></p>',
            onConfirm: (html) => sent.push(html),
        });
        await click(target, ".o_to_markdown_replace");
        assert.containsOnce(target, ".o_to_markdown_loss_warning");
        assert.strictEqual(sent.length, 0, "nothing replaced before confirmation");
        await click(target, ".o_to_markdown_replace");
        assert.strictEqual(sent.length, 0, "a second Replace click does not skip it");
        await click(target, ".o_to_markdown_replace_confirm");
        assert.strictEqual(sent.length, 1);
    });

    QUnit.test("close changes nothing", async (assert) => {
        const sent = [];
        let closed = false;
        await mountDialog({
            mode: "export",
            initialMarkdown: "x",
            close: () => {
                closed = true;
            },
            onConfirm: (html) => sent.push(html),
        });
        await click(target, ".o_to_markdown_close");
        assert.ok(closed);
        assert.strictEqual(sent.length, 0);
    });

    QUnit.test("paste mode keeps Insert and Cancel", async (assert) => {
        await mountDialog({});
        assert.containsOnce(target, ".o_paste_markdown_insert");
        assert.containsNone(target, ".o_to_markdown_copy");
    });
});
