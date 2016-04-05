# -*- coding: utf-8 -*-
# © 2016-TODAY LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Slick Widget Example",
    "summary": "Example usage of the web_widget_slick module",
    "version": "9.0.1.0.0",
    "category": "Hidden",
    "website": "https://laslabs.com/",
    "author": "LasLabs",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web_widget_slick",
    ],
    "data": [
        'views/slick_example_view.xml',
        'security/ir.model.access.csv',
    ],
    "demo": [
        'demo/slick_example_data.xml',
    ]
}
