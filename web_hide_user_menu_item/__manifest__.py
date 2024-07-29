# Copyright 2022 Quartile Limited
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Web Hide User Menu Item",
    "category": "Hidden",
    "version": "15.0.1.0.0",
    "author": "Quartile Limited, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_qweb": [
            "web_hide_user_menu_item/static/src/webclient/user_menu/user_menu.xml",
        ],
    },
    "installable": True,
}
