# Copyright 2026 OCA
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Pivot Merge Rows",
    "summary": "Interactively merge adjacent rows in Pivot views",
    "version": "19.0.1.0.0",
    "development_status": "Alpha",
    "category": "Extra Tools",
    "website": "https://github.com/OCA/web",
    "author": "OCA, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_pivot_merge_rows/static/src/js/pivot_renderer.esm.js",
            "web_pivot_merge_rows/static/src/xml/pivot_renderer.xml",
            "web_pivot_merge_rows/static/src/scss/pivot_renderer.scss",
        ],
        "web.assets_tests": [
            "web_pivot_merge_rows/static/tests/pivot_merge_rows.test.js",
        ],
    },
}
