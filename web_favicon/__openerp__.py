# -*- coding: utf-8 -*-
# © 2015 Therp BV <http://therp.nl>
# © 2016 Pedro M. Baeza
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Custom shortcut icon",
    "version": "9.0.1.0.0",
    "author": "Therp BV, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Website",
    "summary": "Allows to set a custom shortcut icon (aka favicon)",
    "depends": [
        'web',
    ],
    "data": [
        "views/res_company.xml",
        'views/templates.xml',
    ],
    "installable": True,
}
