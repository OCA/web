# Copyright 2026 Jarsa
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Scrollable Lists in Forms",
    "summary": "Lists inside forms scroll within a set number of rows, "
    "header and totals staying in sight",
    "version": "19.0.1.0.0",
    "author": "Jarsa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Web",
    "depends": ["web", "base_setup"],
    "data": ["views/res_config_settings_views.xml"],
    "assets": {
        "web.assets_backend": [
            "web_x2many_list_scroll/static/src/js/x2many_field.esm.js",
            "web_x2many_list_scroll/static/src/xml/x2many_field.xml",
            "web_x2many_list_scroll/static/src/scss/x2many_field.scss",
        ],
        "web.assets_unit_tests": [
            "web_x2many_list_scroll/static/tests/*",
        ],
    },
    "installable": True,
}
