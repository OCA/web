# Copyright 2026 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Widget o2m Attachment Image Gallery Widget",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_o2m_attachment_image_gallery/static/src/**/*.js",
            "web_widget_o2m_attachment_image_gallery/static/src/**/*.xml",
        ],
    },
    "installable": True,
    "maintainers": ["victoralmau"],
}
