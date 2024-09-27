# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Pivot View Hide Total",
    "summary": """
        This addon adds a new inherited version of pivot view.
        It intends to hide the last total column when required.""",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_pivot_hide_total/static/src/**/*",
        ],
    },
    "installable": True,
}
