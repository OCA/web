# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "List Custom View",
    "summary": """Allow technical user to dynamically add fields into list view""",
    "version": "19.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["base"],
    "data": [
        "security/ir_ui_custom_list_field.xml",
        "views/ir_ui_custom_list_field.xml",
    ],
    "demo": [],
    "installable": True,
}
