# -*- coding: utf-8 -*-
##############################################################################
#    
#    Copyright (C) 2012 Domsense srl (<http://www.domsense.com>)
#    Copyright (C) 2012-2013 Agile Business Group sagl
#    (<http://www.agilebg.com>)
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
    'name': 'Export Current View',
    'version': '1.0',
    'category': 'Web',
    'description': """
WEB EXPORT VIEW
===============

One of the best OpenERP’s features is exporting custom data to CSV/XLS. You can do it by clicking on the export link in the sidebar. The export action allows use to configure what to be exported by selecting fields, etc, and allows you to save your export as a template so that you can export it once again without having to configure it again.

That feature is as great and advanced as limited for an everyday-customer-experience. A lot of customers want simply to export the tree view they are looking to.

If you miss this feature as us, probably you’ll find an answer into our web_export_view module.

After you installed it, you’ll find an additional link ‘Export current view’ right below the ‘Export’ one. By clicking on it you’ll get a XLS file contains the same data of the tree view you are looking at, headers included.
""",
    'author': 'Agile Business Group',
    'website': 'http://www.agilebg.com',
    'license': 'AGPL-3',
    'depends': ['web'],
    'external_dependencies' : {
        'python' : ['xlwt'],
     },
    'data': [],
    'active': False,
    'auto_install': False,
    'js': [
        'static/js/web_advanced_export.js',
    ],
}

