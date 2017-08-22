# -*- coding: utf-8 -*-
# Copyright 2016-2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Slick Carousel Widget",
    "summary": "Adds SlickJS slider widget for use as a carousel on Many2one"
    " attachment fields in backend form views.",
    "version": "10.0.1.0.0",
    "category": "Web",
    "website": "https://laslabs.com/",
    "author": "LasLabs, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web",
    ],
    "data": [
        "templates/assets.xml",
    ],
    "qweb": [
        "static/src/xml/web_widget_slick.xml",
    ],
}
