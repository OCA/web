# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Quick Start Screen",
    "summary": "Configurable start screen for quick actions",
    "version": "18.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "web",
    "depends": ["web"],
    "data": [
        "security/ir.model.access.csv",
        "security/security.xml",
        "views/quick_screen_action_view.xml",
        "views/quick_start_screen_views.xml",
        "views/res_users_views.xml",
    ],
    "demo": [
        "demo/quick_screen_action_demo_data.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_quick_start_screen/static/src/scss/quick_start_screen.scss",
            "web_quick_start_screen/static/src/js/**/*",
        ],
    },
}
