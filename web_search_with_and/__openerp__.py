##############################################################################
#
# OpenERP, Open Source Management Solution
# Copyright (C) 2014 by UAB Versada (Ltd.) <http://www.versada.lt>
# and contributors. See AUTHORS for more details.
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
When searching on same field multiple times Odoo joins queries with OR.
Press Shift key to join them with AND.

This gives the same affect as using Advanced Search on same field several times.
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
