# -*- coding: utf-8 -*-
# © initOS GmbH 2013
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name":     "Custom Login Page",
    "version":  "7.0.1.0.0",
    "depends":  ["web"],
    'author':   'initOS GmbH & Co. KG, Odoo Community Association (OCA)',
    "summary":  "Login page depending on selected database",
    'license':  'AGPL-3',
    "description": """
Make login img customizable.
Login page depending on selected database.
    """,
    'data': [
        'res_company_view.xml'
    ],
    'js': ['static/src/js/chrome.js'],
    'installable': True,
    'auto_install': False,
}
