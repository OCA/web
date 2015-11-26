# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2015 Lorenzo Battistini - Agile Business Group
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
    "name" : "Web Digital Signature for sale orders",
    "version" : "8.0.1.0.0",
    "author" : "Agile Business Group, "
               "Odoo Community Association (OCA)",
    "category": 'web',
    "license": "AGPL-3",
    'complexity': "easy",
    'depends': ['web_widget_digital_signature', 'sale'],
    'data': [
        'views/sale_order_view.xml'
    ],
    'website': 'http://www.agilebg.com',
    'installable': True,
    'auto_install': False,
}
