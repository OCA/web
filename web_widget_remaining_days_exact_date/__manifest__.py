# Copyright 2025 Tecnativa - Carlos Roca
# Copyright 2025 Trescloud - César León
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Widget Remaining Days Exact Date",
    "summary": "Allows displaying the exact date alongside the remaining days",
    "version": "18.0.1.0.0",
    "development_status": "Alpha",
    "website": "https://github.com/OCA/web",
    "author": "Tecnativa, Trescloud, Odoo Community Association (OCA)",
    "maintainers": ["CarlosRoca13", "CILC98"],
    "license": "AGPL-3",
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
}
