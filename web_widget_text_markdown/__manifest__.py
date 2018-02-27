# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2014 Sudokeys (<http://www.sudokeys.com>)
#    Copyright (C) 2017 Komit (<http://www.komit-consulting.com>)
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
    'version': '10.0.1.0.0',
    "author": "Komit, "
              "Sudokeys, "
              "Odoo Community Association (OCA)",
    'category': 'Web',
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'depends': [
        'base', 'web'
    ],
    'demo': [
        "demo/bootstrap_markdown.xml",
    ],
    'data': [
        'views/main.xml',
    ],
    "qweb": [
        "static/src/xml/bootstrap_markdown.xml",
    ],
    'installable': True,
    'auto_install': False,
    'application': False
}
