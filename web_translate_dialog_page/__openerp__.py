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

{
    "name": "Web Translate Dialog in Page view",
    "category": "Hidden",
    "description":
        """
Replace the standard translation dialog by an alternative one:

 * Hide the buttons at right of the fields and instead
 * Add a "Translate" button in page view, next to "Edit"
 * The translation dialog displays empty fields for the untranslated fields,
   instead of the source values.
 * Autosize the text boxes

        """,
    "version": "1.0",
    "depends": [
        'web',
        ],
    'js': [
        'static/src/js/web_translate_dialog_page.js',
        ],
    'css' : [
        'static/src/css/base.css',
    ],
    'qweb' : [
        "static/src/xml/base.xml",
    ],
    'auto_install': False,
}


