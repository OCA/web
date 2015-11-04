# -*- coding: utf-8 -*-
##############################################################################
#
#    This file is part of web_clean_navbar, an Odoo module.
#    Copyright (C) 2015-now Equitania Software GmbH(<http://www.equitania.de>).
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
    'name': 'Clean Navbar',
    'version': '8.0.1.0.0',
    'category': 'Tools',
    'summary': 'Better visibility for the backend\'s main menu',
    'license': 'AGPL-3',
    'author': 'Equitania Software GmbH,Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'depends': [
        'web',
    ],
    'data': [
        'views/clean_navbar.xml',
    ],
    'installable': True,
}
