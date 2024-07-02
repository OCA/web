# Copyright 2015-2018 Camptocamp SA, Damien Crier
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Colorize field in tree views",
    "summary": "Allows you to dynamically color fields on tree views",
    "category": "Hidden/Dependency",
    "version": "17.0.1.0.0",
    "depends": ["web"],
    "author": "Camptocamp, Therp BV, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "demo": ["demo/res_users.xml"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_tree_dynamic_colored_field/static/src/xml/list.xml",
            "web_tree_dynamic_colored_field/static/src/js/list_renderer.esm.js",
        ],
    },
}
