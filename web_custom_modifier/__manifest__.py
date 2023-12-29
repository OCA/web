# Copyright 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Custom Modifier",
    "version": "14.0.2.0.1",
    "author": "Numigi, " "Odoo Community Association (OCA)",
    "maintainer": "Numigi",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Project",
    "summary": "Enable easily customizing view modifiers.",
    "depends": ["base"],
    "data": [
        "views/web_custom_modifier.xml",
        "security/ir.model.access.csv",
    ],
    "installable": True,
}
