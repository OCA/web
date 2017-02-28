# -*- coding: utf-8 -*-
# Copyright 2010-2011 OpenERP s.a. (<http://openerp.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Shortcut Menu',
    'version': '10.0.1.0.0',
    'category': 'Web',
    'author': 'OpenERP SA,Odoo Community Association (OCA)',
    'website': 'http://openerp.com',
    'depends': [
        'base',
        'web'
    ],
    'data': [
        'security/ir.model.access.csv',
        'templates/assets.xml',
    ],
    'qweb': [
        'static/src/xml/web_shortcut.xml'
    ],
    'installable': True,
    'auto_install': False,
    'license': 'AGPL-3',
}
