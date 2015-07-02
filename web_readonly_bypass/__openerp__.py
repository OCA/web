# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Nemry Jonathan & Laetitia Gangloff
#    Copyright (c) 2014 Acsone SA/NV (http://www.acsone.eu)
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
    'name': 'Read Only ByPass',
    'version': '1.0',
    "author": "ACSONE SA/NV",
    "maintainer": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "http://www.acsone.eu",
    'category': 'Technical Settings',
    'depends': [
        'web',
    ],
    'summary': 'Allow to save onchange modifications to readonly fields',
    'data': [
        'views/readonly_bypass.xml',
    ],
    'installable': True,
    'auto_install': False,
}
