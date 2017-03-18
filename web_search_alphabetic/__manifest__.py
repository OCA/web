# -*- coding: utf-8 -*-
# Copyright 2014-Today Serpent Consulting Services Pvt. Ltd.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Web Alphabetical Search',
    'author': 'Serpent Consulting Services Pvt. Ltd.,'
              'Odoo Community Association(OCA)',
    'category': 'Web',
    'website': 'http://www.serpentcs.com',
    'description': """
        Odoo Web Search Extended.
        ============================
        This module is used for searching the record base on alphabetical
        character be default it will search on name field.
        User is also able to change search field name instead of name field.
        """,
    'version': '10.0.1.0.0',
    'depends': ['web'],
    'data': [
        'views/template.xml',
    ],
    'qweb': [
        'static/src/xml/web_search.xml',
    ],
    'installable': True,
    'auto_install': False
}
