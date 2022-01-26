# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2017 Tecnativa - Vicent Cubells
# Copyright 2018 Tecnativa - Jairo Llopis
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Advanced search",
    "version": "14.0.1.0.0",
    "author": "Therp BV, " "Tecnativa, " "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Easier and more powerful searching tools",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": ["views/templates.xml"],
    "qweb": [
        "static/src/xml/web_advanced_search.xml",
    ],
    "installable": True,
    "application": False,
}
