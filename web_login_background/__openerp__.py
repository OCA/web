# -*- coding: utf-8 -*-
# © initOS GmbH 2016
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Web Login Background",
    "version": "7.0.1.0.0",
    'author': 'initOS GmbH, Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    "description": """
Add new login background img.
Use background img if it is set.
Allow to remove the login img.
    """,
    'data': ["res_company_view.xml",
             ],
    'js': ['static/src/js/chrome.js'
           ],
    'installable': True,
    'auto_install': False,
}
