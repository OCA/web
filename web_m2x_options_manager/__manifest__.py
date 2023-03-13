# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web M2X Options Manager",
    "summary": 'Adds an interface to manage the "Create" and'
    ' "Create and Edit" options for specific models and'
    " fields.",
    "version": "16.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Web",
    "data": [
        "security/ir.model.access.csv",
        "views/ir_model.xml",
    ],
    "demo": [
        "demo/res_partner_demo_view.xml",
    ],
    "depends": ["base", "web_m2x_options"],
    "website": "https://github.com/OCA/web",
    "installable": True,
}
