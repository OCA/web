# Copyright 2026 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Widget Sub View",
    "summary": """Create a subview widget""",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_sub_view/static/src/**/*.esm.js",
            "web_widget_sub_view/static/src/**/*.xml",
        ],
    },
    "demo": [
        "demo/partner_sub_view.xml",
    ],
}
