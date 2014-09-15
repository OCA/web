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
    "name":     "Webmodule add wildcard operators for advanced search",
    "version":  "0.1",
    "depends":  ["web"],
    'author':   'initOS GmbH & Co. KG',
    "category": "",
    "summary":  "Simular search in searchbar",
    'license':  'AGPL-3',
    "description": """
    Allows =ilike operator to advanced search option.
    Use % as a placeholder.
    Example: "Zip matches 1%" gives all zip starting with 1
    Also allows insensitive exact search.
    Example "Name matches john" will find "John" and "john" but not "Johnson".
    """,
    'data': [
    ],
    'demo': [
    ],
    'test': [
    ],
    'js': ['static/src/js/search.js'],
    'installable': True,
    'auto_install': False,
}
