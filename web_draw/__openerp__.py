# -*- coding: utf-8 -*-
# © 2016 ONESTEiN BV (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Draw Field',
    'images': [],
    'category': 'Extra Tools',
    'version': '9.0.1.0.0',
    'author': 'ONESTEiN BV,Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'http://www.onestein.eu',
    'depends': ['base', 'web'],
    'data': [
        'views/web_draw.xml',
    ],
    'qweb': [
        'static/src/xml/web_draw.xml',
    ],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'application': True,
}