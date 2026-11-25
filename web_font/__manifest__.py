# Copyright 2026 Ecosoft Co., Ltd. (https://ecosoft.co.th)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Font",
    "summary": "Change the font of the backend web client",
    "version": "20.0.1.0.0",
    "author": "Ecosoft, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "depends": ["base_setup"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_font/static/src/web_font.esm.js",
            "web_font/static/src/web_font.scss",
        ],
        "web.assets_unit_tests": [
            "web_font/static/tests/**/*.js",
        ],
    },
    "maintainers": ["Saran440", "Pani-k-folk"],
    "installable": True,
}
