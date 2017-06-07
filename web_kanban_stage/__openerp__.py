# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    'name': 'Kanban - Stage Support',
    'summary': 'Provides stage model and abstract logic for inheritance',
    'version': '9.0.1.0.0',
    'author': "LasLabs, Odoo Community Association (OCA)",
    'category': 'Web',
    'depends': [
        'web_kanban',
    ],
    'website': 'https://laslabs.com',
    'license': 'LGPL-3',
    'data': [
        'security/ir.model.access.csv',
        'views/web_kanban_abstract.xml',
        'views/web_kanban_stage.xml',
    ],
    'installable': True,
    'application': False,
}
