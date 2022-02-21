# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2017 Tecnativa - Vicent Cubells
# Copyright 2018 Tecnativa - Jairo Llopis
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Advanced search",
    "summary": "Easier and more powerful searching tools",
    "version": "15.0.1.0.0",
    "author": "Therp BV, Tecnativa, Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "maintainers": ["ivantodorovich"],
    "license": "AGPL-3",
    "category": "Usability",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_advanced_search/static/src/js/**/*.js",
        ],
        "web.assets_qweb": [
            "web_advanced_search/static/src/xml/**/*.xml",
        ],
    },
}
