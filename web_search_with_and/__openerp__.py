##############################################################################
#
# OpenERP, Open Source Management Solution
# Copyright (C) 2015 by UAB Versada (Ltd.) <http://www.versada.lt>
# and contributors.
#
# All Rights Reserved.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': "Force AND on Search Input",
    'version': '0.1',
    'author': 'Versada UAB, Odoo Community Association (OCA)',
    'category': 'web',
    'website': 'http://www.versada.lt',
    'description': """
Force AND on Search Input
=========================

When searching for records on same field Odoo joins multiple queries with OR.
For example:

* Perform a search for customer "John" on field Name
* Odoo displays customers containing "John"
* Search for "Smith" on same field Name
* Odoo displays customers containing "John" OR "Smith"

With this module installed you can press Shift key before searching for "Smith"
and Odoo finds customers containing "John" AND "Smith"

Usage
=====

* Enter your value in Search Input field
* Press and hold Shift key
* Select field with mouse or keyboard to perform search on
    """,
    'depends': [
        'web',
    ],
    'data': [
        'data.xml',
    ],
    'installable': True,
    'application': False,
}
