# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2014 Ayni Cia. Ltda. (<http://www.ayni.io>).
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
    'name': 'Placeholder for Date Field',
    'description': '''
This addon add a placeholder to all date field using format 
from res.lang configuration.
Date format on lang: %m/%d/%Y will show mm/dd/YYYY

**Only support %m %d %Y**

This module works on OpenERP 7.0, 8.0 not tested
''',
    'version': '1.0',
    'author': 'Ayni Cia. Ltda.',
    'category': 'Usability',
    'license': 'AGPL-3',
    'depends': [
        'web',
        ],
    'js': [
        'static/src/js/web_placeholder_date.js'
        ],
}
