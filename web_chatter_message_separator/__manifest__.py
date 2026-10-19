# Copyright 2026 - TODAY, Escodoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Chatter Message Separator",
    "summary": "Add a visual separator between each message of the chatter",
    "version": "16.0.1.0.0",
    "category": "Web",
    "license": "AGPL-3",
    "author": "Escodoo, Odoo Community Association (OCA)",
    "maintainers": ["WesleyOliveira98"],
    "website": "https://github.com/OCA/web",
    "depends": ["mail"],
    "assets": {
        "web.assets_backend": [
            "web_chatter_message_separator/static/src/**/*.xml",
            "web_chatter_message_separator/static/src/**/*.scss",
        ],
    },
}
