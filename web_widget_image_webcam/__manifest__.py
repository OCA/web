# Copyright 2016 Siddharth Bhalgami <siddharth.bhalgami@gmail.com>
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    "name": "Web Widget - Image WebCam",
    "summary": "Allows to take image with WebCam",
    "version": "12.0.1.0.0",
    "category": "web",
    "website": "https://github.com/OCA/web",
    "author": "Tech Receptives, "
              "Kaushal Prajapati, "
              "Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "data": [
        "views/assets.xml",
    ],
    "depends": [
        "web",
    ],
    "qweb": [
        "static/src/xml/web_widget_image_webcam.xml",
    ],
    "installable": True,
}
