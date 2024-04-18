# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2016 Pedro M. Baeza
# Copyright 2024 OERP Canada <https://www.oerp.ca>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Custom shortcut icon",
    "version": "17.0.1.0.0",
    "author": "Therp BV, "
    "Tecnativa, "
    "OERP Canada,"
    "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Website",
    "summary": "Allows to set a custom shortcut icon (aka favicon)",
    "website": "https://github.com/OCA/web",
    "depends": [
        "web",
    ],
    "data": ["views/res_company_views.xml", "views/templates.xml"],
    "installable": True,
}
