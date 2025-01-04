# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

{
    "name": "Preview in many2many_binary widget",
    "summary": "Allows developers to enable previews in binary widgets",
    "version": "14.0.1.0.0",
    "development_status": "Alpha",
    "category": "Technical",
    "website": "https://github.com/OCA/web",
    "author": "Hunki Enterprises BV, Odoo Community Association (OCA)",
    "maintainers": ["hbrunn"],
    "license": "AGPL-3",
    "depends": [
        "web",
    ],
    "data": [
        "views/templates.xml",
    ],
    "qweb": [
        "static/src/web_widget_many2many_binary_preview.xml",
    ],
}
