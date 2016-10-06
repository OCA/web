# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2014 Sudokeys (<http://www.sudokeys.com>)
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
    'name': 'web_widget_text_markdown',
    'version': '8.0.1.0.0',
    'author': "Sudokeys,Odoo Community Association (OCA)",
    'maintainer': 'Sudokeys',
    'category': '',
    'license': 'AGPL-3',
    'depends': ['base', 'web'],
    'website': 'http://www.sudokey.com',
    'data': ['views/main.xml', ],
    "qweb": ["static/src/xml/bootstrap_markdown.xml",
             ],
    'demo': [],
    'installable': False,
    'auto_install': False,
    'application': False
}
