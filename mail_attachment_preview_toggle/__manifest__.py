# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Mail Attachment Preview Toggle",
    "summary": "Allows users to show or hide the attachment preview panel on forms.",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["mail"],
    "data": ["views/res_users.xml"],
    "assets": {
        "web.assets_backend": ["/mail_attachment_preview_toggle/static/src/**/*.js"],
    },
    "maintainers": ["sbejaoui"],
}
