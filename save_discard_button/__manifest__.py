# Copyright (C) 2023-TODAY Synconics Technologies Pvt. Ltd. (<http://www.synconics.com>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Save & Discard Buttons",
    "version": "16.0.1.0.1",
    "summary": "Save & Discard Buttons",
    "license": "AGPL-3",
    "category": "Tools",
    "author": "Synconics Technologies Pvt. Ltd., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/server-tools",
    "depends": ["web"],
    "data": [],
    "images": ["static/description/main_screen.png"],
    "assets": {
        "web.assets_backend": [
            "save_discard_button/static/src/scss/indicator_button.scss"
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
