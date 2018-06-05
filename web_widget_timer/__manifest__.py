# -*- coding: utf-8 -*-
# Copyright 2016 Onestein (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Web Widget Timer',
    'summary': 'This module introduces a new timer widget for form views.',
    'category': 'Extra Tools',
    'version': '10.0.1.0.0',
    'author': 'Onestein, Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'depends': ['web'],
    'data': [
        'views/web_timer.xml',
    ],
    'qweb': ['static/src/xml/web_timer.xml',],
}
