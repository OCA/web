# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
#    Author Markus Schneider <markus.schneider at initos.com>
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
    "name": "Dashboard Tile",
    "version": "0.4",
    "depends": ['web', 'board', 'mail'],
    'author': "initOS GmbH & Co. KG,GRAP,Odoo Community Association (OCA)",
    "category": "",
    'license': 'AGPL-3',
    "description": """
    module to give you a dashboard where you can configure tile from any view
    and add them as short cut.
    Tile can be:
        * affected to a user;
        * be global for all users (In that case, some tiles will be hidden if
          the current user doesn't have access to the given model);

    Kown issues/limits:
    * change color picks wrong color
    * can not edit tile from dashboard
    * context are ignored
    * date filter can not be relative
    * combine domain of menue and filter so can not restore origin filter

    possible future improvments:
    * support context_today
    * add icons
    * support client side action (like inbox)
    * support select int/float column with min/max/avg/sum to display

    """,
    "summary": "Add tile to dashboard",
    'data': ['tile.xml',
             'security/ir.model.access.csv',
             'security/rules.xml'],
    'css': ['static/src/css/tile.css'],

    'demo': [
        'demo/res_groups.yml',
        'demo/tile_tile.yml',
    ],
    'test': [
    ],
    'installable': True,
    'auto_install': False,
    'js': ['static/src/js/custom_js.js'],
    'qweb': ['static/src/xml/custom_xml.xml'],
}
