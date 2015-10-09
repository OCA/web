# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2014 Therp BV (<http://therp.nl>).
#    copyright (C) 2015 Leonardo Donelli @ MONKSoftware
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
    'name': 'Show images in tree views',
    'version': '8.0.1.1.0',
    'author': 'Therp BV, MONK Software, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/Web',
    'license': 'AGPL-3',
    'category': 'Web',
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
