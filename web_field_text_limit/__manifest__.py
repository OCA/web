# Copyright 2025 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Web Field Text Limit",
    "version": "15.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "development_status": "Alpha",
    "license": "AGPL-3",
    "category": "Web",
    "summary": "Adds an option to be able to limit displayed size of a text field",
    "depends": ["base"],
    "data": [
        "security/ir.model.access.csv",
        "data/data.xml",
        "views/text_limit_views.xml",
    ],
}
