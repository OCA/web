# -*- encoding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2012 credativ Ltd (<http://credativ.co.uk>).
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
    'name': 'Web Export All',
    'application': False,
    'version': '1.1',
    'category': 'Web',
    'description': '''
Allows all rows to be exported from a search view including
the ones not on the current page. Data is streamed back from
the server to prevent timeouts and memory issues when exporting
many records.
        ''',
    'author': 'credativ Ltd,Odoo Community Association (OCA)',
    'website': 'http://credativ.co.uk',
    'license': 'AGPL-3',
    "depends": [
        'web'
    ],
    'init_xml': [],
    'update_xml': [],
    'demo_xml': [],
    'installable': True,
    "js": [
        "static/src/js/data_export.js",
    ],
    "qweb": [
        "static/src/xml/web_exportall.xml",
    ],
}
