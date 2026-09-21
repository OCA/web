# Copyright 2025 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Chatter Camera",
    "summary": """Allow to use the camera on mobile views for adding attachments""",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": [
        "mail",
    ],
    "assets": {
        "web.assets_backend": [
            "web_chatter_camera/static/src/components/**/*.esm.js",
            "web_chatter_camera/static/src/components/**/*.xml",
        ],
    },
}
