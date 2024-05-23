# Copyright 2022 Hynsys Technologies
# Copyright 2024 Alitec Pte Ltd
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Chatter Position",
    "summary": "Add an option to change the chatter position",
    "version": "17.0.1.0.1",
    "author": "Hynsys Technologies, Camptocamp, Alitec Pte Ltd, "
    "Odoo Community Association (OCA)",
    "maintainers": ["trisdoan"],
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Extra Tools",
    "depends": ["web", "mail"],
    "data": ["views/res_users.xml", "views/web.xml"],
    "assets": {
        "web.assets_backend": [
            "/web_chatter_position/static/src/**/*.js",
            "/web_chatter_position/static/src/**/*.scss",
        ],
    },
}
