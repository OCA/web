# Copyright 2025 jaco.tech
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Iconify",
    "version": "18.0.1.0.0",
    "category": "Web",
    "summary": "Provides core Iconify integration for Odoo. This module "
    "integrates the Iconify SVG framework into Odoo, allowing developers "
    "to easily use a wide variety of icons in their modules.",
    "author": "jaco.tech, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "license": "AGPL-3",
    "assets": {
        "web.assets_backend": [
            "/web_iconify/static/lib/iconify/iconify-icon.js",
            "/web_iconify/static/src/css/web_iconify.css",
        ],
    },
    "installable": True,
    "auto_install": False,
}
