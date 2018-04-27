# -*- coding: utf-8 -*-
# Copyright 2018 Raphaël Reverdy - Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Cache name_get",
    "version": "10.0.1.0.0",
    "author": "Akretion, "
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Limit useless name_get requests",
    "depends": [
        'web',
    ],
    "data": [
        'views/view.xml',
    ],
    'installable': True,
    "application": False,
}
