# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2014 Therp BV (<http://therp.nl>).
#
#    Snippet from https://github.com/hsd/listview_images
#    Copyright (C) 2013 Marcel van der Boom <marcel@hsdev.com>
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
    "name": "Show images in tree views",
    "version": "1.0",
    "author": "Therp BV",
    "description": """\
This module defines a tree image widget, to be used with either binary fields
or (function) fields of type character. Use widget='tree_image' in your view
definition. Optionally, set a 'height' tag. Default height is 16px.

If you use the widget with a character field, the content of the field can be
any of the following:

* the absolute or relative location of an image. For example, \
"/<module>/static/src/img/youricon.png"

* a standard icon from the web distribution, without path or extension, For \
example, 'gtk-open'

* A dynamic image in a data url base 64 format. Prefix with \
'data:image/png;base64,'
    """,
    'url': 'https://github.com/OCA/Web',
    'depends': [
        'web',
    ],
    'qweb': [
        'static/src/xml/widget.xml',
    ],
    'data': [
        'view/assets.xml',
    ],
}
