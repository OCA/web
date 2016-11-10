# -*- coding: utf-8 -*-
# © 2010-2013 OpenERP s.a. (<http://openerp.com>).
# © 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
{
    "name": "Dashboard Tile",
    "summary": "Add Tiles to Dashboard",
    "version": "8.0.3.0.0",
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
