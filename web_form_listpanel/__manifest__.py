# Copyright 2026 Roberto Fichera
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Form List Panel",
    "summary": "Browse correlated records in a list panel beside the form",
    "version": "19.0.1.0.0",
    "author": "Roberto Fichera, Odoo Community Association (OCA)",
    "maintainers": ["robyf70"],
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Web",
    "depends": ["base_setup", "web"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_form_listpanel/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "web_form_listpanel/static/tests/**/*",
        ],
    },
}
