# Copyright 2025 Cetmix OÜ
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Refresh From Backend",
    "summary": "Refresh views from backend",
    "version": "16.0.1.0.0",
    "category": "Web",
    "license": "LGPL-3",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["mail"],
    "assets": {
        "web.assets_backend": [
            "web_refresh_from_backend/static/src/views/list/list_controller_patch.esm.js",
            "web_refresh_from_backend/static/src/views/kanban/kanban_controller_patch.esm.js",
            "web_refresh_from_backend/static/src/views/form/form_controller_patch.esm.js",
        ],
    },
    "installable": True,
    "auto_install": False,
}
