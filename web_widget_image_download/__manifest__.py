# Copyright 2016 Flavio Corpa <flavio.corpa@tecnativa.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
{
    "name": "Web Widget - Image Download",
    "summary": "Allows to download any image from its widget",
    "version": "15.0.1.0.0",
    "category": "web",
    "website": "https://github.com/OCA/web",
    "author": "Tecnativa, Odoo Community Association (OCA), Kaushal Prajapati",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_image_download/static/src/js/**/*",
            "web_widget_image_download/static/src/scss/**/*",
        ],
        "web.assets_qweb": [
            "web_widget_image_download/static/src/xml/**/*",
        ],
    },
}
