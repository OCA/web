# Copyright 2026 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web View Monetary Format",
    "version": "18.0.1.0.0",
    "category": "Hidden",
    "summary": "Currency-aware decimal formatting in aggregated views",
    "author": "Quartile, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend_lazy": [
            "web_view_monetary_format/static/src/views/pivot/**/*",
        ],
        "web.assets_tests": [
            "web_view_monetary_format/static/src/test/**/*",
        ],
    },
    "installable": True,
    "maintainers": ["yostashiro", "AungKoKoLin1997"],
}
