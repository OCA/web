# Copyright 2016-2017 LasLabs Inc.
# Copyright 2017-2018 Tecnativa - Jairo Llopis
# Copyright 2018-2019 Tecnativa - Alexandre Díaz
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Responsive",
    "summary": "Responsive web client, community-supported",
    "version": "15.0.1.0.0",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "author": "LasLabs, Tecnativa, " "Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "installable": True,
    "depends": ["web", "mail"],
    "development_status": "Production/Stable",
    "maintainers": ["Yajo", "Tardo"],
    "data": ["views/res_users.xml", "views/web.xml"],
    "qweb": [
        "static/src/xml/apps.xml",
        "static/src/xml/form_buttons.xml",
        "static/src/xml/menu.xml",
        "static/src/xml/navbar.xml",
        "static/src/xml/attachment_viewer.xml",
        "static/src/xml/discuss.xml",
        "static/src/xml/control_panel.xml",
        "static/src/xml/search_panel.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_responsive/static/src/css/**/*",
            "web_responsive/static/src/js/**/*",
        ],
    },
    "sequence": 1,
}
