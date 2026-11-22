The widget is the OWL component `MarkdownField` (`static/src/js/markdown_field.esm.js`),
registered as `markdown` in the `fields` registry. It mounts a Toast UI editor in edit
mode and a Toast UI viewer in read-only mode, and commits the Markdown on blur and
before the record is saved.

Tests: QUnit suite `web_widget_markdown_editor`, run by `tests/test_js.py`.
