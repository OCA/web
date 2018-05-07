# -*- coding: utf-8 -*-
# Copyright 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Date intervals",
    "version": "8.0.1.0.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Hidden/Dependency",
    "summary": "Widget to conveniently specify date intervals",
    "website": "https://github.com/OCA/web",
    "depends": [
        'web',
    ],
    "data": [
        "demo/ir_module_module.xml",
        'views/templates.xml',
    ],
    "qweb": [
        "static/src/xml/web_widget_date_interval.xml",
    ],
}
