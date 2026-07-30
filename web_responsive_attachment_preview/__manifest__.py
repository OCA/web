# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

{
    "name": "Responsive web client, with attachment preview",
    "summary": "Always show the attachment preview ie on invoices",
    "version": "16.0.1.0.0",
    "development_status": "Beta",
    "category": "Technical",
    "website": "https://github.com/OCA/web",
    "author": "Hunki Enterprises BV, Odoo Community Association (OCA)",
    "maintainers": ["hbrunn"],
    "license": "AGPL-3",
    "depends": [
        "web_responsive",
    ],
    "assets": {
        "web.assets_backend": [
            "web_responsive_attachment_preview/static/src/js/form_controller.esm.js",
        ],
    },
}
