# Copyright 2020 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Domain Field Example",
    "summary": "Show and test web_domain_field module",
    "version": "12.0.1.0.0",
    "license": "AGPL-3",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web_domain_field", "product"],
    "data": [
        "views/product_selection_example.xml",
        "views/menu.xml",
        "security/ir.model.access.csv",
    ],
    "demo": ["demo/product_demonstration.xml"],
}
