# Copyright 2025 jaco.tech
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Iconify Proxy",
    "summary": "Proxies requests to the Iconify API, providing SVG icons, CSS,"
    " and JSON data. It also implements caching using Odoo's "
    "ir.attachment model.",
    "version": "18.0.1.0.0",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "author": "jaco.tech, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_iconify_proxy/static/src/js/iconify_api_provider.js",
        ],
    },
    "installable": True,
    "auto_install": False,
    "tests": ["tests/test_main.py"],
}
