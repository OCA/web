# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Darkroom Image Widget",
    "summary": "Widget provides a dynamic, editable canvas for use on any"
    " One2many image field in backend form views.",
    "version": "9.0.1.0.1",
    "category": "Web",
    "website": "https://laslabs.com/",
    "author": "LasLabs, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web",
    ],
    "data": [
        'views/assets.xml',
    ],
    'qweb': [
        "static/src/xml/field_templates.xml",
    ],
    'demo': [
        'demo/res_users.xml',
    ]
}
