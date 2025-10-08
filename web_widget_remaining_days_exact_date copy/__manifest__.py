# Copyright 2025 Trescloud:César León
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Disable Widget Remaining Days Widget",
    "summary": "Disable Widget Remaining Days by Widget",
    "category": "Hidden",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "author": "Trescloud:César León (github: CILC98), Odoo Community Association (OCA)",
    "depends": ["web"],
    "data": [
        "security/disable_remaining_days_security.xml",
        "security/ir.model.access.csv",
        "views/disable_remaining_days_rule_views.xml",
        "views/res_config_settings_views.xml",
        "wizards/disable_remaining_days_rule_wizard_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_widget_remaining_days_exact_date/static/src/**/*",
        ]
    },
    "installable": True,
}
