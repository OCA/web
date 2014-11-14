# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
#    Author Markus Schneider <markus.schneider at initos.com>
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
    "name": "Dashboard Tile",
    "version": "0.3",
    "depends": ['web', 'board'],
    'author': 'initOS GmbH & Co. KG',
    "category": "",
    'license': 'AGPL-3',
    "description": """

    """,
    "summary": "Add tile to dashboard",
    'data': ['tile.xml',
             'security/ir.model.access.csv',
             'security/rules.xml'],
    'css': ['static/src/css/tile.css'],
    'demo': [
    ],
    'test': [
    ],
    'installable': True,
    'auto_install': False,
    'js': ['static/src/js/custom_js.js'],
    'qweb': ['static/src/xml/custom_xml.xml'],
}
