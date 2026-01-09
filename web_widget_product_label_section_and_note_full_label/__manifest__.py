# Copyright 2025 ForgeFlow S.L. (https://www.forgeflow.com)
# Part of ForgeFlow. See LICENSE file for full copyright and licensing details.

{
    "name": "Web Widget Product Label Section And Note Full Label",
    "summary": "Display the full label in the product_label_section_and_note widget.",
    "version": "18.0.1.0.0",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["account", "web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_product_label_section_and_note_full_label/static/src/**/*.js",
            "web_widget_product_label_section_and_note_full_label/static/src/**/*.xml",
        ],
    },
    "application": False,
    "installable": True,
}
