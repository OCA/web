# Copyright 2025 Yves Goldberg (Ygol InternetWork)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Widget Markdown Editor",
    "summary": "Markdown editor widget for text fields (Toast UI Editor)",
    "version": "16.0.1.0.0",
    "category": "Web",
    "author": "Yves Goldberg (Ygol InternetWork),Odoo Community Association (OCA)",
    "maintainers": ["ygol"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "development_status": "Alpha",
    "depends": ["web"],
    "demo": ["demo/res_groups_demo.xml"],
    "assets": {
        "web.assets_backend": [
            "web_widget_markdown_editor/static/src/lib/toastui-editor.min.css",
            "web_widget_markdown_editor/static/src/css/markdown_field.css",
            "web_widget_markdown_editor/static/src/lib/toastui-editor-all.min.js",
            "web_widget_markdown_editor/static/src/js/markdown_field.esm.js",
            "web_widget_markdown_editor/static/src/xml/markdown_field.xml",
        ],
        "web.qunit_suite_tests": [
            "web_widget_markdown_editor/static/tests/**/*",
        ],
    },
    "installable": True,
}
