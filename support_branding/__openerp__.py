# -*- coding: utf-8 -*-
# Copyright 2012-2015 Therp BV (<http://therp.nl>)
# Copyright 2016 - Tecnativa - Angel Moya <odoo@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Support branding",
    "summary": "Adds your branding to an Odoo instance",
    "category": "Dependecy/Hidden",
    "version": "9.0.2.0.0",
    "license": "AGPL-3",
    "author": "Therp BV,Tecnativa,Odoo Community Association (OCA)",
    "website": 'http://therp.nl',
    "depends": [
        'web',
    ],
    "qweb": [
        'static/src/xml/base.xml',
    ],
    "data": [
        "data/ir_config_parameter.xml",
        'views/qweb.xml',
    ],
    'installable': True,
}
