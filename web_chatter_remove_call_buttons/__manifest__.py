# Copyright 2025 Commown SCIC
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

{
    "name": "Web - Remove call buttons from Chatter view",
    "summary": "Remove call buttons from the Chatter view",
    "version": "16.0.1.0.0",
    "development_status": "Alpha",
    "category": "Uncategorized",
    "website": "https://github.com/OCA/web",
    "author": "Odoo Community Association (OCA)",
    "maintainers": ["fcayre", "Honeyxilia"],
    "license": "AGPL-3",
    "depends": [
        "mail",
    ],
    "assets": {
        "mail.assets_messaging": [
            "/web_chatter_remove_call_buttons/static/src/js/remove_call_buttons.esm.js",
            "/web_chatter_remove_call_buttons/static/src/xml/discuss_sidebar.xml",
        ],
        "web.assets_backend": [
            "/web_chatter_remove_call_buttons/static/src/js/remove_call_buttons.esm.js",
            "/web_chatter_remove_call_buttons/static/src/xml/discuss_sidebar.xml",
        ],
    },
}
