# Copyright 2019 GRAP - Quentin DUPONT
# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

{
    "name": "Web Widget Numeric Step",
    "category": "web",
    "version": "16.0.1.0.2",
    "author": "GRAP, Tecnativa, " "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_numeric_step/static/src/xml/numeric_step.xml",
            "web_widget_numeric_step/static/src/js/numeric_step.esm.js",
        ],
    },
    "auto_install": False,
    "installable": True,
}
