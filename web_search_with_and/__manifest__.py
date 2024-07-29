# Copyright 2015 Andrius Preimantas <andrius@versada.lt>
# Copyright 2020 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

{
    "name": "Use AND conditions on omnibar search",
    "version": "15.0.1.0.2",
    "author": "Versada UAB, ACSONE SA/NV, Serincloud, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "web",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "/web_search_with_and/static/src/js/control_panel_model_extension.js",
            "/web_search_with_and/static/src/js/search_bar.js",
        ],
    },
}
