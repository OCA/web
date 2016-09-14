# -*- coding: utf-8 -*-
# © 2016 Therp BV <http://therp.nl>.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


{
    "name": "Search x2x fields",
    "version": "7.0.1.0.0",
    "author": "Therp BV, "
              "Odoo Community Association (OCA)",
    "description": """
Standard behavior in advanced search for one2many, many2many and many2one
fields is to do a `name_search`. This often is not satisfactionary as you
might want to search for other properties. There might also be cases where
you don't exactly know what you're searching for, then a list of possible
options is necessary too. This module enables you to have a full search view
to select the record in question, and either select specific records or select
them using a search query of its own.
Backported from 8.0 to 7.0, the same functionality that appears in the new v8
search area will appear in the v7 search dropdown.
To improve usability a small javascript modification has been introduced so
that the main search popup doesn't close when closing the advanced search
domain popups.
    """,
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Use a search widget in advanced search for x2x fields",
    "depends": [
        'web',
    ],
    "qweb": [
        'static/src/xml/web_advanced_search_x2x.xml',
    ],
    'js': ['static/src/js/*.js'],
    'css': ['static/src/css/*.css'],
    "auto_install": False,
    "installable": True,
    "application": False,
}
