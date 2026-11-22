The module patches `HtmlField.wysiwygOptions` (powerbox commands) and
`HtmlField.startWysiwyg` (toolbar button). The conversions are exported functions of
`static/src/js/paste_markdown.esm.js`:

- `markdownToHtml` renders the Markdown with markdown-it, sanitizes it with DOMPurify
  when raw HTML is allowed, then adds inline styles and Odoo checklists
  (`makeHtmlOdooCompatible`). Without markdown-it, the text is inserted escaped in a
  paragraph.
- `htmlToMarkdown` simplifies the HTML of the editor (`normalizeOdooHtml`), then
  converts it with Turndown and the GFM rules of `addGfmRules` (tables, strikethrough,
  task lists, compact list markers). Without Turndown, the text is returned.

The libraries are in `static/lib` (markdown-it 15.0.3, Turndown 7.2.5), unchanged from
their npm packages, without source maps.

Tests: QUnit suite `web_editor_paste_markdown`, run by `tests/test_js.py`.
