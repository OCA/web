# -*- coding: utf-8 -*-
# Copyright 2013 Therp BV (<http://therp.nl>).
# Copyright 2015 Pedro M. Baeza <pedro.baeza@serviciosbaeza.com>
# Copyright 2015 Antonio Espinosa <antonio.espinosa@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Clickable many2one fields for tree views",
    "summary": "Open the linked resource when clicking on their name",
    "version": "9.0.1.0.0",
    "category": "Hidden",
    "website": "https://odoo-community.org/",
    "author": "Therp BV, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        'web',
    ],
    "data": [
        'data/ir_config_parameter.xml',
        'views/asset.xml',
    ],
}
