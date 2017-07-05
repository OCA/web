# -*- coding: utf-8 -*-
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Digitized Signature for Stock Pickings",
    "version": "9.0.1.0.0",
    "author": "Tecnativa, "
               "Odoo Community Association (OCA)",
    "website": "https://www.tecnativa.com",
    "category": "web",
    "license": "AGPL-3",
    "depends": [
        "stock",
        "web_widget_digitized_signature",
    ],
    "data": [
        "views/stock_views.xml",
        "report/report_deliveryslip.xml",
        "report/report_stockpicking_operations.xml",
        "data/picking_template.xml",
    ],
    "installable": True,
}
