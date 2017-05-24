# -*- coding: utf-8 -*-
# © initOS GmbH 2017
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Search x2x fields",
    "version": "10.0.1.0.0",
    "author": "Therp BV, "
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
    "test": [
    ],
    "auto_install": False,
    'installable': True,
    "application": False,
    "external_dependencies": {
        'python': [],
    },
}
