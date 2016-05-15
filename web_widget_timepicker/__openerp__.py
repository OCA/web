# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2016 Michael Fried @ Vividlab (<http://www.vividlab.de>).
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
    'name': '',
    'version': '0.1',
    'author': 'Vividlab, Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'category': 'Web',
    'website': 'https://github.com/OCA/Web',

    # any module necessary for this one to work correctly
    'depends': [
     'web'
    ],

    'css': [ 'static/src/css/jquery.timepicker.css',
			 'static/src/css/timepicker.css',
			],
    'js': [  'static/src/js/timepicker_widget.js',
			 'static/src/js/jquery.timepicker.js',
			],
    'qweb' : [ 'static/src/xml/time_picker.xml', ],

    # always loaded
    'data': [
        'views/assets.xml',
    ],

    #Installation options
    "installable": True,
}
