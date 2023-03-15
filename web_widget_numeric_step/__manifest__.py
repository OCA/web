# Copyright 2019 GRAP - Quentin DUPONT
# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

{
    "name": "Web Widget Numeric Step",
    "category": "web",
    "version": "16.0.1.0.0",
    "author": "GRAP, Tecnativa, " "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "demo": ["demo/res_users_view.xml"],
    "assets": {
        "web.assets_backend": [
            "web_widget_numeric_step/static/src/js/numeric_step.js",
            "web_widget_numeric_step/static/src/css/numeric_step.scss",
        ],
        "web.assets_qweb": [
            "web_widget_numeric_step/static/src/xml/numeric_step.xml",
        ],
    },
    "auto_install": False,
    "installable": True,
}
