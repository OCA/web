# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2014 Therp BV (<http://therp.nl>).
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
    "name" : "Context in colors and fonts",
    "summary": "Use the context in a tree view's colors and fonts attribute",
    "version" : "1.1",
    "author" : "Therp BV",
    "complexity": "normal",
    "category" : "Hidden/Dependency",
    "depends" : [
        'web',
    ],
    "data": [
        'view/qweb.xml',
    ],
    "auto_install": False,
    "installable": True,
    "application": False,
}
