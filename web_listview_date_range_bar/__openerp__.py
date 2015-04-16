# -*- coding: utf-8 -*-
###############################################################################
#
#   Copyright (C) 2015 initOS GmbH & Co. KG (<http://www.initos.com>).
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU Affero General Public License as
#   published by the Free Software Foundation, either version 3 of the
#   License, or (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU Affero General Public License for more details.
#
#   You should have received a copy of the GNU Affero General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################

{
    'name': 'Listview date range bar.',
    'version': '1.0',
    'category': '',
    'summary': 'Add date range selector bar widget above list view rows.',
    'description': """
Date range selelction toolbar for list view widget.
===================================================

* Defines a new 'listview_date_range_bar' toolbar widget the lines of a list view
  with two date selector widgets that allow you to specifiy a date range.
* To use this in your models list view set 'listview_date_range_bar' as view_mode
  for the window action that shows your view.
* Everytime a date is changed a reload of the current content of the list view
  is triggered.
* The selected start and end dates are accessible in the context of the search()
  function in your model and subsequently called functions like read().
* To use the generic start/end dates from context to filter your model by custom
  fields, override search() in your model and modify the domain with the date
  range given in context before calling the super class search().
* The context fields to use are:
    'list_date_range_bar_start' / 'list_date_range_bar_end'
* By default the date fields are empty. If 'list_date_range_bar_start'/ 'list_date_range_bar_end'
  are already present in context when showing the widget than their values are
  used to set the initial date range.

""",
    'author': 'initOS GmbH & Co. KG',
    'website': 'http://www.initos.com',
    'depends': [
        'web',
    ],
    'data': [
    ],
    'demo': [
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
    'images': [
    ],
    'css': [
        'static/src/css/web_listview_date_range_bar.css',
    ],
    'js': [
        'static/src/js/web_listview_date_range_bar.js',
    ],
    'qweb': [
        'static/src/xml/web_listview_date_range_bar.xml',
    ],
}