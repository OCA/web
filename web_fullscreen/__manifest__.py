# -*- coding: utf-8 -*-
# Copyright 2016 Onestein (<http://www.onestein.eu>)
# Copyright 2019 Sunflower IT (<http://www.sunflowerweb.nl>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Fullscreen',
    'summary': 'Adds a fullscreen mode button',
    'author': 'Onestein, Sunflower IT, Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web/',
    'category': 'Extra Tools',
    'version': '10.0.1.0.0',
    'depends': ['web'],
    'data': [
        'views/web_fullscreen_view.xml'
    ],
    'qweb': [
        'static/src/xml/*.xml'
    ],
    'installable': True,
}
