# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Chatter Position Toggle",
    "summary": "Add a button to toggle the chatter position in form views",
    "version": "18.0.1.0.0",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Extra Tools",
    "depends": ["web_chatter_position"],
    "assets": {
        "web.assets_backend": [
            "/web_chatter_position_toggle/static/src/**/*.js",
            "/web_chatter_position_toggle/static/src/**/*.xml",
            "/web_chatter_position_toggle/static/src/**/*.scss",
        ],
    },
    "installable": True,
    "auto_install": False,
}
