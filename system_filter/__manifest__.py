# -*- coding: utf-8 -*-
# Copyright 2018 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "System Filter",
    'description': """
    Add possibility to have Filters used only by the system""",
    'author': 'ACSONE SA/NV,Odoo Community Association (OCA)',
    'website': "http://acsone.eu",
    'category': 'Category',
    'version': '10.0.1.0.0',
    'license': 'AGPL-3',
    'depends': [
        'base',
    ],
    'data': [
        'views/ir_filters.xml',
    ],
    'development_status': 'Alpha',
}
