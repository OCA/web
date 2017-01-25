# -*- coding: utf-8 -*-
# © 2016 Vividlab (<http://www.vividlab.de>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Web Timepicker Widget",
    "version": "9.0.1.0.0",
    "author": "VividLab, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Web",
    "website": "http://www.vividlab.de",
    'installable': False,
    "depends": [
        "web",
    ],
    "css": [
        "static/src/lib/jquery.timerpicker/jquery.timepicker.css",
        "static/src/css/web_widget_timepicker.css",
    ],
    "js": [
        "static/src/lib/jquery.timerpicker/jquery.timepicker.js",
        "static/src/js/web_widget_timepicker.js",
    ],
    "data": [
        "views/web_widget_timepicker_assets.xml",
    ],
    "qweb": [
        "static/src/xml/web_widget_timepicker.xml",
    ]
}
