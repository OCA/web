# Copyright 2024 Tecnativa - Carlos Roca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Systray Button Init Action",
    "summary": "Add a button to go to the user init action.",
    "version": "19.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "data": [
        "views/res_users_views.xml",
    ],
    "assets": {
        "web.assets_backend": ["web_systray_button_init_action/static/src/button/*"],
        "web.assets_tests": [
            "web_systray_button_init_action/static/src/tours/tour.esm.js",
        ],
    },
    "installable": True,
}
