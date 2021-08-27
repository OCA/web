# Copyright 2021 Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Switch Company Menu Code",
    "version": "14.0.1.0.0",
    "author": "Akretion, " "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Add a prefix to company names",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "qweb": [
        "static/src/xml/switch_company_menu_code.xml",
    ],
    "data": ["views/res_company.xml"],
    "installable": True,
    "application": False,
}
