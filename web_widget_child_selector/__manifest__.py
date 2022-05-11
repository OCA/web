# Copyright 2019 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Widget Child Selector",
    "summary": "Widget used for navigation on hierarchy fields",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "author": "Creu Blanca,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_child_selector/static/src/js/**/*",
            "web_widget_child_selector/static/src/scss/**/*",
        ],
        "web.assets_qweb": ["web_widget_child_selector/static/src/xml/**/*"],
    },
    "qweb": ["static/src/xml/widget_child_selector.xml"],
}
