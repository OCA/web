# Copyright 2019 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
{
    "name": "Translatable URL widget",
    "version": "16.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "category": "Web",
    "depends": ["web"],
    "summary": """Enable to set translation on fields using URL widget""",
    "website": "https://github.com/OCA/web",
    "installable": True,
    "license": "LGPL-3",
    "assets": {
        "web.assets_backend": [
            "web_widget_url_translatable/static/src/views/fields/url/*",
        ],
    },
}
