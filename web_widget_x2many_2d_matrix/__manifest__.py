# -*- coding: utf-8 -*-
# Copyright 2015 Holger Brunn <hbrunn@therp.nl>
# Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "2D matrix for x2many fields",
    "version": "9.0.1.0.0",
    "author": "Therp BV, "
              "Tecnativa,"
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Hidden/Dependency",
    "summary": "Show list fields as a matrix",
    "depends": [
        'web',
    ],
    "data": [
        'views/templates.xml',
    ],
    "qweb": [
        'static/src/xml/web_widget_x2many_2d_matrix.xml',
    ],
    'installable': False,
}
