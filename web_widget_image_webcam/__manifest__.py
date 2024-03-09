# Copyright 2016 Siddharth Bhalgami <siddharth.bhalgami@gmail.com>
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    "name": "Web Widget - Image WebCam",
    "summary": "Allows to take image with WebCam",
    "version": "16.0.1.0.0",
    "category": "web",
    "website": "https://github.com/OCA/web",
    "author": "Tech Receptives, "
    "Kaushal Prajapati, "
    "Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_image_webcam/static/src/lib/webcam.js",
            "web_widget_image_webcam/static/src/js/webcam_widget.js",
            "web_widget_image_webcam/static/src/css/web_widget_image_webcam.css",
            "web_widget_image_webcam/static/src/xml/web_widget_image_webcam.xml",
        ]
    },
    "installable": True,
}
