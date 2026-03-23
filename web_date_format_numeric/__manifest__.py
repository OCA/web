# Copyright 2026 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Date Format Numeric",
    "summary": "Display all date/datetime fields in numeric format",
    "version": "19.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [
        "views/res_lang_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_date_format_numeric/static/src/**/*.js",
        ],
        "web.assets_unit_tests": [
            "web_date_format_numeric/static/tests/**/*.js",
        ],
    },
    "installable": True,
}
