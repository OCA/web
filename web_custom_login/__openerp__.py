# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2013 initOS GmbH & Co. KG (<http://www.initos.com>).
#    Author Thomas Rehn <thomas.rehn at initos.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    "name":     "Custom Login Page",
    "version":  "7.0.1.0.0",
    "depends":  ["web"],
    'author':   'initOS GmbH & Co. KG, Odoo Community Association (OCA)',
    "category": "",
    "summary":  "Login page depending on selected database",
    'license':  'AGPL-3',
    "description": """
Make login img customizable.
Login page depending on selected database.
    """,
    'data': [
        'res_company_view.xml'
    ],
    'demo': [
    ],
    'test': [
    ],
    'js': ['static/src/js/chrome.js'],
    'installable': True,
    'auto_install': False,
}
