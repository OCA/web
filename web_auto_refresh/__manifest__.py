# -*- coding: utf-8 -*-
# Copyright 2018 Kmee Informática
# Gabriel Cardoso de Faria <gabriel.cardoso@kmee.com.br>
# Fisher Yu <szufisher@gmail.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'Web Auto Refresh',
    'version': '10.0.1.0.0',
    'author': 'Gabriel Cardoso de Faria, Fisher Yu, Odoo Community Association (OCA)',
    'category': 'Base',
    'website': 'https://github.com/kmee',
    'depends': ['web', 'bus', 'mail'],
    'data': [
        'views/web_auto_refresh.xml',
    ],
    'installable': True
}
