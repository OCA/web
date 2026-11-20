# Copyright 2025 Yves Goldberg (Ygol InternetWork)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Editor Paste Markdown",
    "summary": "Paste Markdown in HTML fields from the editor command menu",
    "version": "16.0.1.0.0",
    "category": "Web",
    "author": "Yves Goldberg (Ygol InternetWork),Odoo Community Association (OCA)",
    "maintainers": ["ygol"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "development_status": "Alpha",
    "depends": ["web_editor", "web_widget_markdown_editor"],
    "assets": {
        "web.assets_backend": [
            "web_editor_paste_markdown/static/src/css/paste_markdown.css",
            "web_editor_paste_markdown/static/src/js/paste_markdown.esm.js",
            "web_editor_paste_markdown/static/src/xml/paste_markdown.xml",
        ],
        "web.qunit_suite_tests": [
            "web_editor_paste_markdown/static/tests/**/*",
        ],
    },
    "installable": True,
}
