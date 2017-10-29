# -*- coding: utf-8 -*-
# Copyright (c) 2015 ACSONE SA/NV (<http://acsone.eu>)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    'name': 'Read Only ByPass',
    'version': '10.0.1.0.1',
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "website": "http://www.acsone.eu",
    "license": "LGPL-3",
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
