# Copyright 2025 Dinar Gabbasov <git.diga@gmail.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Backend Action",
    "summary": "Send actions from the backend to the UI via the bus "
    "and execute them immediately",
    "version": "16.0.1.0.0",
    "category": "Extra Tools",
    "license": "LGPL-3",
    "author": "Odoo Community Association (OCA), Dinar Gabbasov",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "bus"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_backend_action/static/src/js/services/*.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
