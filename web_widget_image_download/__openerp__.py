# -*- coding: utf-8 -*-
# Copyright 2016 Flavio Corpa <flavio.corpa@tecnativa.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    "name": "Web Widget - Image Download",
    "summary": "Allows to download any image from its widget",
    "version": "9.0.1.0.0",
    "category": "web",
    "website": "https://www.tecnativa.com",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "data": [
        "views/assets.xml",
    ],
    "depends": [
        "web",
    ],
    "qweb": [
        "static/src/xml/web_widget_image_download.xml",
    ]
}
