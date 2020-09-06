# Copyright 2018 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Drop target support",
    "version": "12.0.1.1.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Allows to drag files into Odoo",
    "depends": [
        'web',
        'document'
    ],
    "data": [
        'views/templates.xml',
    ],
    "qweb": [
        'static/src/xml/widgets.xml',
    ]
}
