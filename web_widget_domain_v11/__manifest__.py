# -*- coding: utf-8 -*-
# Copyright 2017 Jairo Llopis <jairo.llopis@tecnativa.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    "name": "Odoo 11.0 Domain Widget",
    "summary": "Updated domain widget",
    "version": "10.0.1.0.1",
    "category": "Extra Tools",
    "website": "https://www.tecnativa.com/",
    "author": "Tecnativa, Odoo S.A., Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web",
    ],
    "data": [
        "templates/assets.xml",
        "views/ir_filters.xml",
    ],
    "qweb": [
        "static/src/copied-xml/templates.xml",
    ],
}
