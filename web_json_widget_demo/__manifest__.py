# Copyright 2025 Lambdao
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).


{
    "name": "Partner JSON Demo",
    "version": "18.0.1.0.0",
    "category": "Demo",
    "summary": "Adds a JSON field to partners and displays it with the JSON widget.",
    "author": "Lambdao, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": [
        "contacts",
        "web_json_widget",
    ],
    "data": ["views/res_partner_view.xml"],
    "installable": True,
    "application": False,
    "auto_install": False,
}
