# Copyright 2024 Sergio Corato <https://github.com/sergiocorato>
# Copyright 2024 Marco Colombo <https://github.com/TheMule71>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web hide statusbar on edit",
    "version": "14.0.1.0.0",
    "category": "Extra Tools",
    "summary": "Hide statusbar when the user is editing the document.",
    "author": "Sergio Corato, Marco Colombo, " "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": [
        "account",
        "web",
    ],
    "data": [
        "views/form.xml",
    ],
    "installable": True,
}
