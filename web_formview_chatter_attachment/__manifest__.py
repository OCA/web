# Copyright 2009-2024 Noviat
# Copyright 2026 CIT Services
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Form View Chatter Attachment",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "company": "CIT Services",
    "author": "CIT Services, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "category": "Web",
    "summary": "Chatter Attachment widget for Form View",
    "depends": ["mail"],
    "assets": {
        "web.assets_backend": [
            "web_formview_chatter_attachment/static/src/scss/attachment_box.scss",
            "web_formview_chatter_attachment/static/src/js/oe_chatter_compiler.esm.js",
        ],
    },
    "installable": True,
}
