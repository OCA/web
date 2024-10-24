# Copyright 2023 Camptocamp SA - Telmo Santos
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Select All Companies",
    "summary": "Allows you to select all companies in one click.",
    "version": "14.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "qweb": ["static/src/xml/switch_all_company_menu.xml"],
    "data": ["views/web_select_all_companies.xml"],
    "installable": True,
}
