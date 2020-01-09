# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
{
    "name": "Web Image URL",
    "summary": "This module provides web widget for displaying image from URL",
    "category": "Web",
    "version": "12.0.1.0.0",
    "license": "LGPL-3",
    "author": "Modoolar, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web/",
    "depends": ["web"],
    "data": [
        "views/web_widget_image_url.xml",
    ],
    "qweb": ["static/src/xml/*.xml"],
    "installable": True,
}
