###############################################################################
#
#    bus_enhanced module for OpenERP, improve bus connection client side
#    Copyright (C) 2014 ANYBOX (<http://www.anybox.fr>)
#                         Jean-Sebastien SUZANNE <jssuzanne@anybox.fr>
#
#    This file is a part of anybox_login_demo
#
#    web_notification is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License v3 or later
#    as published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    anybox_login_demo is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License v3 or later for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    v3 or later along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################
{
    'name': 'Bus enhanced',
    'version': '1.0.0',
    'sequence': 150,
    'category': 'Anybox',
    'author': 'ANYBOX','OCA'
    'website': 'www.anybox.fr',
    'depends': [
        'base',
        'web',
        'bus',
    ],
    'data': [
        'template.xml'
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'AGPL-3',
}
