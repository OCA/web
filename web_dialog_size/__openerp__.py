# -*- coding: utf-8 -*-
##############################################################################
#
#     This file is part of web_dialog_sizes, an Odoo module.
#
#     Copyright (c) 2015 ACSONE SA/NV (<http://acsone.eu>)
#
#     web_expand_dialog is free software: you can redistribute it and/or
#     modify it under the terms of the GNU Affero General Public License
#     as published by the Free Software Foundation, either version 3 of
#     the License, or (at your option) any later version.
#
#     web_expand_dialog is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the
#     GNU Affero General Public License
#     along with web_expand_dialog.
#     If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': "Web Dialog Size",

    'summary': """
        A module that lets the user expand a
        dialog box to the full screen width.""",

    'author': "ACSONE SA/NV, "
              "Tecnativa, "
              "Therp BV, "
              "Odoo Community Association (OCA), "
              "Siddharth Bhalgami",

    'website': "http://acsone.eu",
    'category': 'web',
    'version': '9.0.1.0.0',
    'license': 'AGPL-3',

    'depends': [
        'web',
    ],
    'qweb': [
        'static/src/xml/web_dialog_size.xml',
    ],
    'data': [
        'view/qweb.xml',
    ],
    'installable': True,
}
