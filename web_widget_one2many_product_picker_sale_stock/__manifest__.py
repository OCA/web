# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Widget One2Many Product Picker Sale Stock",
    "summary": "Adds support for stock in the one2many product picker widget",
    "version": "13.0.1.0.0",
    "category": "Website",
    "author": "Tecnativa, " "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web_widget_one2many_product_picker", "sale_stock"],
    "data": ["templates/assets.xml"],
    "qweb": ["static/src/xml/one2many_product_picker.xml"],
    "installable": True,
    "auto_install": False,
}
