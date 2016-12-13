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
# -*- coding: utf-8 -*-
# © 2010-2013 OpenERP s.a. (<http://openerp.com>).
# © 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
{
    "name": "Dashboard Tile",
    "summary": "Add Tiles to Dashboard",
    "version": "9.0.1.0.0",
    "depends": [
        'web',
        'board',
        'mail',
        'web_widget_color',
    ],
    'author': 'initOS GmbH & Co. KG, '
              'GRAP, '
              'Odoo Community Association (OCA)',
    "category": "web",
    'license': 'AGPL-3',
    'contributors': [
        'initOS GmbH & Co. KG',
        'GRAP',
        'Iván Todorovich <ivan.todorovich@gmail.com>'
    ],
    'data': [
        'views/tile.xml',
        'views/templates.xml',
        'security/ir.model.access.csv',
        'security/rules.xml',
    ],
    'demo': [
        'demo/res_groups.yml',
        'demo/tile_tile.yml',
    ],
    'qweb': [
        'static/src/xml/custom_xml.xml',
    ],
}
