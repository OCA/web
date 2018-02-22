# -*- coding: utf-8 -*-
# Copyright 2016-2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Slick Carousel Widget Example",
    "summary": "Example usage of the web_widget_slick and "
               "web_widget_slickroom modules",
    "version": "10.0.1.0.0",
    "category": "Hidden",
    "website": "https://laslabs.com/",
    "author": "LasLabs, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web_widget_slickroom",
    ],
    "data": [
        'views/slick_example_view.xml',
        'security/ir.model.access.csv',
    ],
    "demo": [
        'demo/slick_example_data.xml',
    ],
}
