# -*- coding: utf-8 -*-
# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# © 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Help Popup',
    'version': '10.0.1.0.0',
    'author': 'Akretion, Odoo Community Association (OCA)',
    'depends': [
        'web',
    ],
    'website': 'https://www.akretion.com',
    'license': 'AGPL-3',
    'data': [
        'views/popup_help_view.xml',
        'views/action_view.xml',
        'report/report.xml',
        'report/help.xml',
    ],
    'demo': [
        'demo/help.xml',
    ],
    'qweb': [
        'static/src/xml/popup_help.xml',
    ],
    'installable': True,
}
