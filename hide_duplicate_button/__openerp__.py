# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2013 Agile Business Group sagl (<http://www.agilebg.com>)
#    Copyright (C) 2013 Domsense srl (<http://www.domsense.com>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
    'name': 'Hide duplicate button',
    'version': '0.1',
    'category': 'Web',
    'description': """As 'duplicate' button often produce inconveniences when
modules don't correctly handle the 'copy' methods, this module allow to hide
'duplicate' button for every form view""",
    'author': 'Agile Business Group',
    'website': 'http://www.agilebg.com',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'init_xml': [],
    'update_xml': [],
    'demo_xml': [],
    'active': False,
    'installable': True,
    'css': [
        "static/css/duplicate_button.css",
    ],
}
