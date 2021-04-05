# Copyright (C) 2021 Open Source Integrators
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Hide Menu",
    "summary": """
        configure Hide Menu
    """,
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "Open Source Integrators, " "Odoo Community Association (OCA)",
    "maintainer": "Open Source Integrators",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "base"],
    "demo": [
        "security/ir.model.access.csv",
        "views/res_users.xml",
        "views/hide_menu.xml",
    ],
    "installable": True,
}
