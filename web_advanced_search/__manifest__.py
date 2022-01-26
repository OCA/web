# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2017 Tecnativa - Vicent Cubells
# Copyright 2018 Tecnativa - Jairo Llopis
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Advanced search",
    "version": "15.0.1.0.0",
    "author": "Therp BV, " "Tecnativa, " "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Easier and more powerful searching tools",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_advanced_search/static/src/js/control_panel/advanced_filter_item.js",
            "web_advanced_search/static/src/js/control_panel/filter_menu.js",
            "web_advanced_search/static/src/js/control_panel/custom_filter_item.js",
            "web_advanced_search/static/src/js/human_domain.js",
            "web_advanced_search/static/src/js/relational.js",
        ],
        "web.assets_qweb": [
            "web_advanced_search/static/src/xml/web_advanced_search.xml",
        ],
    },
    "installable": True,
    "application": False,
}
