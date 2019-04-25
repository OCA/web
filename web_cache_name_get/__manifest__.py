# -*- coding: utf-8 -*-
# Copyright 2018 Raphaël Reverdy - Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Cache name_get",
    "version": "10.0.1.0.1",
    "website": "https://github.com/OCA/web",
    "author": "Akretion, "
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Limit useless name_get requests",
    "maintainers": ["hparfr"],
    "depends": [
        'web',
    ],
    "data": [
        'views/view.xml',
    ],
    'installable': True,
}
