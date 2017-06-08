# -*- coding: utf-8 -*-
# Copyright 2016 ThinkOpen Solutions
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Fast languages switcher',
    'version': '8.0.1.0.0',
    'author': 'ThinkOpen Solutions,Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'https://thinkopen.solutions',
    'data': [
        'views/templates.xml',
    ],
    'depends': ['base', 'web'],
    'qweb': ['static/src/xml/*.xml'],
    'application': False,
    'installable': True,
    'auto_install': False,
}
