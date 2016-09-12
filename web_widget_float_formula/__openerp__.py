# -*- coding: utf-8 -*-
# Copyright GRAP
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Web Widget - Formulas in Float Fields',
    'summary': 'Allow use of simple formulas in float fields',
    'version': '9.0.1.0.0',
    'category': 'Web',
    'author': 'GRAP, LasLabs, Odoo Community Association (OCA)',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'views/web_widget_float_formula.xml',
    ],
    'installable': True,
    'application': False,
}
