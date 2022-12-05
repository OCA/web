# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Simple many2one widget",
    "version": "15.0.1.1.0",
    "license": "AGPL-3",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "maintainers": ["Tardo"],
    "demo": [
        "demo/res_partner_view.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_widget_many2one_simple/static/src/css/many2one_simple.scss",
            "web_widget_many2one_simple/static/src/js/many2one_simple_field.js",
        ],
        "web.assets_qweb": [
            "web_widget_many2one_simple/static/src/xml/many2one_simple.xml",
        ],
    },
}
