The module patches `HtmlField.wysiwygOptions` to add the powerbox command. The
conversion is the exported function `markdownToHtml` of
`static/src/js/paste_markdown.esm.js`: it renders the Markdown with an off-screen Toast
UI viewer, then adds inline styles (`makeHtmlOdooCompatible`). Without Toast UI, the
text is inserted escaped in a paragraph.

Tests: QUnit suite `web_editor_paste_markdown`, run by `tests/test_js.py`.
