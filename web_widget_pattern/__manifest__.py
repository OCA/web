# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

{
    "name": "Input patterns",
    "summary": "Allows to define a regex for validating input on the backend",
    "version": "16.0.1.0.0",
    "development_status": "Alpha",
    "category": "Technical",
    "website": "https://github.com/OCA/web",
    "author": "Hunki Enterprises BV, Odoo Community Association (OCA)",
    "maintainers": ["hbrunn"],
    "license": "AGPL-3",
    "depends": [
        "web",
    ],
    "data": [],
    "demo": [
        "demo/res_partner_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_widget_pattern/static/src/*.xml",
            "web_widget_pattern/static/src/*.esm.js",
        ],
    },
}
