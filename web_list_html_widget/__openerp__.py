# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
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
    "name": "HTML widget for list/tree views",
    "version": "0.1",
    "depends": ["web"],
    'author': 'initOS GmbH & Co. KG',
    "category": "",
    'license': 'AGPL-3',
    "description": """This module allows to use a widget="html" for fields in
list(tree) views.

*WARNING* The content of the field will be rendered without HTML escaping and
without any other security measure.""",
    'data': [
    ],
    'demo': [
    ],
    'test': [
    ],
    'js': ['static/src/js/view_list.js'],
    'installable': True,
    'auto_install': False,
}
