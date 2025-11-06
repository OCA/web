# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web M2X Options Manager",
    "summary": 'Adds an interface to manage the "Create" and'
    ' "Create and Edit" options for specific models and'
    " fields.",
    "version": "17.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Web",
    "data": [
        "security/ir.model.access.csv",
        "views/ir_model.xml",
        "views/m2x_create_edit_option.xml",
    ],
    "demo": [
        "demo/res_partner_demo_view.xml",
    ],
    "depends": [
        # OCA/server-tools
        "base_view_inheritance_extension",
        # OCA/web
        "web_m2x_options",
    ],
    "website": "https://github.com/OCA/web",
    "installable": True,
    "pre_init_hook": "pre_init_hook",
}
