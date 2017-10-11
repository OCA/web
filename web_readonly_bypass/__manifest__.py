# -*- coding: utf-8 -*-
# Copyright 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Read Only ByPass',
    'version': '10.0.1.0.1',
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "maintainer": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "http://www.acsone.eu",
    'category': 'Technical Settings',
    'depends': [
        'web',
    ],
    'summary': 'Allow to save onchange modifications to readonly fields',
    'data': [
        'views/readonly_bypass.xml',
    ],
    'installable': True,
    'auto_install': False,
}
