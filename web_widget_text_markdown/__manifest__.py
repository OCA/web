# Copyright (C) 2014 Sudokeys (<http://www.sudokeys.com>)
# Copyright (C) 2017 Komit (<http://www.komit-consulting.com>)
#
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Widget Text Markdown",
    "version": "15.0.1.0.0",
    "author": "Alexandre Díaz, "
    "Komit, "
    "Sudokeys, "
    "Sunflower IT, "
    "Odoo Community Association (OCA)",
    "category": "Web",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "summary": "Widget to text fields that adds markdown support",
    "depends": ["web"],
    "demo": ["demo/bootstrap_markdown.xml"],
    "data": [],
    "installable": True,
    "auto_install": False,
    "application": False,
    "assets": {
        "web.assets_backend": [
            "/web_widget_text_markdown/static/src/js/web_widget_text_markdown.js",
        ],
        "web.qunit_suite": [
            "/web_widget_text_markdown/static/tests/js/web_widget_text_markdown.js",
        ],
    },
}
