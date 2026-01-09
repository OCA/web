# Copyright 2024 Tecnativa - Carlos Roca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Systray Button Init Action",
    "summary": "Add a button to go to the user init action.",
    "version": "18.0.1.0.2",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": ["web_systray_button_init_action/static/src/button/*"],
        "web.assets_tests": [
            "web_systray_button_init_action/static/src/tours/tour.esm.js",
        ],
    },
    "installable": True,
}
