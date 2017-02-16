# -*- coding: utf-8 -*-
# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Search x2x fields",
    "version": "9.0.1.0.0",
    "author": "Therp BV, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Use a search widget in advanced search for x2x fields",
    "depends": [
        'web',
    ],
    "data": [
        'views/templates.xml',
    ],
    "qweb": [
        'static/src/xml/web_advanced_search_x2x.xml',
    ],
    "auto_install": False,
    'installable': True,
    "application": False,
}
