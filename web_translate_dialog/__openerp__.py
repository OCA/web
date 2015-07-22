# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Guewen Baconnier
#    Copyright 2012 Camptocamp SA
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

{"name": "Web Translate Dialog",
 "category": "Hidden",
 "description": """
Replace the standard translation view by an alternative one:

 * Add a "Translate" button item in the "More" menu
 * The translations are displayed in a dialog (much like the OpenERP
   6.1's one)
 * Support HTML fields
 * Autosize the textareas to the size of the content

""",
 "version": "1.0",
 "depends": ['web'],
 'data': ['view/web_translate.xml'],
 'qweb': ["static/src/xml/base.xml"],
 'auto_install': False,
 'installable': True,
 }
