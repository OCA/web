# -*- coding: utf-8 -*-
##############################################################################
#
#     This file is part of web_option_auto_color,
#     an Odoo module.
#
#     Copyright (c) 2015 ACSONE SA/NV (<http://acsone.eu>)
#
#     web_option_auto_color is free software:
#     you can redistribute it and/or modify it under the terms of the GNU
#     Affero General Public License as published by the Free Software
#     Foundation,either version 3 of the License, or (at your option) any
#     later version.
#
#     web_option_auto_color is distributed
#     in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
#     even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
#     PURPOSE.  See the GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with web_option_auto_color.
#     If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': "Web Option Auto Color",
    'author': "ACSONE SA/NV,Odoo Community Association (OCA)",
    'website': "http://acsone.eu",
    'category': 'web',
    'version': '8.0.0.1.0',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'views/web_option_auto_color.xml',
    ],
    'qweb': [
        'static/src/xml/templates.xml',
    ],
}
