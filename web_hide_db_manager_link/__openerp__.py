# -*- coding: utf-8 -*-
##############################################################################
#
#    Odoo, Open Source Management Solution
#
#    Copyright (c) All rights reserved:
#        (c) 2015      Anubía, soluciones en la nube,SL (http://www.anubia.es)
#                      Alejandro Santana <alejandrosantana@anubia.es>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see http://www.gnu.org/licenses
#
##############################################################################

{
    'name': 'Hide link to database manager in login screen',
    'version': "8.0.1.0.0",
    'category': 'Web',
    'license': 'AGPL-3',
    'author': 'Alejandro Santana, Odoo Community Association (OCA)',
    'website': 'http://anubia.es',
    'summary': 'Hide link to database manager in login screen',
    'depends': ['web'],
    'data': ['views/webclient_templates.xml'],
    'installable': True,
}
