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
    'name': 'Web Drag and Drop Upload',
    'category': 'Backend',
    'summary': 'Drag and Drop Upload in Sidebar',
    'version': '1.0',
    'description': """
Drag and Drop Upload
===================
This module adds Drag and Drop capabilities to the Sidebar and as Widget
        """,
    'author': 'Agent ERP GmbH, Andreas Tolstov',
    'website': 'http://www.agent-erp.de',
    'depends': ['web','document'],
    'data': ['views/drag_drop_upload.xml'],
    'qweb': ['views/drag_drop_upload_tmpl.xml'],
    'installable': True,
    'application': True,
}
