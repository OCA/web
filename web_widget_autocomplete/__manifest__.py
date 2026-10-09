# Copyright 2026 Cetmix OÜ
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

{
    "name": "Web Widget Autocomplete",
    "summary": "Autocomplete widget",
    "version": "18.0.1.0.0",
    "development_status": "Beta",
    "category": "Hidden",
    "website": "https://github.com/OCA/web",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_autocomplete/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "web_widget_autocomplete/static/tests/**/*",
        ],
    },
}
