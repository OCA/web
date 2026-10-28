# Copyright 2026 Luca Orioli <lucaorioli@gmail.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Resizable Chatter",
    "summary": "Resize the side chatter by dragging its edge",
    "version": "19.0.1.0.0",
    "category": "Extra Tools",
    "author": "Luca Orioli, Odoo Community Association (OCA)",
    "maintainers": ["lucaorioli"],
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["mail"],
    "assets": {
        "web.assets_backend": [
            "web_chatter_resizable/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "web_chatter_resizable/static/tests/**/*",
        ],
    },
}
