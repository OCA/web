# -*- encoding: utf-8 -*-
############################################################################
#
#    OpenERP, Open Source Web Color
#    Copyright (C) 2012 Savoir-faire Linux (<http://www.savoirfairelinux.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
#    @author Étienne Beaudry Auger <etienne.b.auger@savoirfairelinux.com>
#
##############################################################################
{
    'name': "Web Color",
    'author': "Savoir-faire Linux,Odoo Community Association (OCA)",
    'category': "Hidden",
    'description': """
    This module provides a color widget to display the color from
    the hexadecimal value of your field.
    """,
    'version': "1.0",
    'depends': ['web'],
    'js': [
        'static/src/js/lib.js',
        'static/lib/really-simple-color-picker/jquery.colorPicker.js',
    ],
    'css': [
        'static/src/css/color.css',
        'static/lib/really-simple-color-picker/colorPicker.css',
    ],
    'qweb': ['static/src/xml/lib.xml'],
    'installable': True,
    'auto_install': False,
    'web_preload': False,
}
