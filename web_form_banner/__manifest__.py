# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Form Banner",
    "summary": "Show configurable, rule-based alert banners on backend form views",
    "version": "20.0.1.0.0",
    "category": "Web",
    "author": "Quartile, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "data": [
        "views/web_form_banner_rule_views.xml",
        "security/ir.access.csv",
    ],
    "assets": {
        "web.assets_backend": [
            "web_form_banner/static/src/js/*.esm.js",
            "web_form_banner/static/src/scss/*.scss",
        ],
    },
    "demo": ["demo/web_form_banner_rule_demo.xml"],
    "maintainers": ["yostashiro", "aungkokolin1997"],
    "installable": True,
}
