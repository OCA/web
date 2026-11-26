# Copyright 2026 Sébastien Couratin, Semper Connect
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Responsive User Menu",
    "summary": "Move the app menu preferences to the user menu",
    "version": "18.0.1.0.0",
    "author": "Sébastien Couratin, Semper Connect, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Web",
    "depends": ["web_responsive"],
    "assets": {
        "web.assets_backend": [
            "web_responsive_user_menu/static/src/js/web_responsive_user_menu.esm.js",
        ],
    },
    "installable": True,
    "application": False,
}
