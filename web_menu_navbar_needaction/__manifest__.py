# -*- coding: utf-8 -*-
# Copyright 2015-2018 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Needaction counters in main menu",
    "version": "10.0.1.0.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Show the sum of submenus' needaction counters in main menu",
    "depends": [
        'web',
        'mail',
    ],
    "data": [
        "data/ir_ui_menu.xml",
        "views/ir_ui_menu.xml",
        "data/ir_config_parameter.xml",
        'views/templates.xml',
    ],
}
