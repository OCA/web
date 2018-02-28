# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2014 Agent ERP GmbH
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
#
##############################################################################

{
    'name': 'Web Widget Binary Drag and Drop Upload',
    'category': 'Backend',
    'summary': 'Drag and Drop Upload in Sidebar',
    'version': '8.0.1.0.0',
    'author': 'Agent ERP GmbH, Odoo Community Association (OCA)',
    "license": "AGPL-3",
    'website': 'http://www.agenterp.com',
    'depends': ['web','document'],
    'data': ['views/drag_drop_upload.xml'],
    'qweb': ['views/drag_drop_upload_tmpl.xml'],
    'installable': True,
    'application': True,
}
