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
    "summary": "Add Tiles to Dashboard",
    "version": "7.0.1.0.1",
    "depends": [
        'web',
        'board',
        'mail',
        'web_widget_color',
    ],
    'author': "initOS GmbH & Co. KG,GRAP,Odoo Community Association (OCA)",
    "category": "",
    'license': 'AGPL-3',
    "description": """
Add Tiles to Dashboard
======================
Features:
---------
module to give you a dashboard where you can configure tile from any view
and add them as short cut.

* Tile can be:
    * displayed only for a user;
    * global for all users (In that case, some tiles will be hidden if
      the current user doesn't have access to the given model);
* The tile displays items count of a given model restricted to a given domain;
* Optionnaly, the tile can display the result of a function of a field;
    * Function is one of sum/avg/min/max/median;
    * Field must be integer or float;

Screenshot:
-----------
* Dashboad sample, displaying Sale Orders to invoice:
.. image:: web_dashboard_tile/static/src/img/screenshot_dashboard.png
* Tree view displayed when user click on the tile:
.. image:: web_dashboard_tile/static/src/img/screenshot_action_click.png


Kown issues/limits:
-------------------
* can not edit tile from dashboard (color, sequence, function, ...);
* context are ignored;
* date filter can not be relative;
* combine domain of menue and filter so can not restore origin filter;

possible future improvments:
----------------------------
* support context_today;
* add icons;
* support client side action (like inbox);
    """,
    'data': [
        'view/tile.xml',
        'security/ir.model.access.csv',
        'security/rules.xml',
    ],
    'css': [
        'static/src/css/tile.css',
    ],
    'demo': [
        'demo/res_groups.yml',
        'demo/tile_tile.yml',
    ],
    'js': [
        'static/src/js/custom_js.js',
    ],
    'qweb': [
        'static/src/xml/custom_xml.xml',
    ],
}
