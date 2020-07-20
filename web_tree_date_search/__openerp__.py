# -*- coding: utf-8 -*-
# Copyright 2015 Noviat nv/sa (http://www.noviat.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Tree dates search',
    'version': '8.0.1.0.0',
    'author': 'Noviat, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    'category': 'Web',
    'depends': [
        'web',
    ],
    'data': [
        'views/assets_backend.xml',
    ],
    'qweb': [
        'static/src/xml/web_tree_date_search.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'installable': True,
}
