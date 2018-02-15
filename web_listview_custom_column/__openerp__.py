# -*- coding: utf-8 -*-
# Copyright 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Custom columns in listview",
    "version": "9.0.1.0.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Tools",
    "summary": "Remove or add columns to list views",
    "depends": [
        'web',
        'base_view_inheritance_extension',
    ],
    "data": [
        "security/res_groups.xml",
        'views/templates.xml',
        'security/ir.model.access.csv',
    ],
    "qweb": [
        'static/src/xml/web_listview_custom_column.xml',
    ],
}
