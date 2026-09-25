# Copyright 2026 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "No Create from Search Dialog",
    "version": "18.0.1.0.0",
    "category": "Technical",
    "summary": "Hide New button in many2one/many2many search dialogs",
    "author": "Quartile, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["base_setup"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_m2x_dialog_no_create/static/src/select_create_dialog.esm.js",
            "web_m2x_dialog_no_create/static/src/select_create_dialog.xml",
        ],
        "web.assets_unit_tests": [
            "web_m2x_dialog_no_create/static/tests/**/*",
        ],
    },
    "installable": True,
}
