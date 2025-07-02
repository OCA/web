# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Session Auto Close",
    "summary": """Automatically logs out inactive users based on a configurable
    timeout.""",
    "version": "18.0.1.0.1",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": ["views/res_config_settings.xml"],
    "assets": {
        "web.assets_backend": [
            "web_session_auto_close/static/src/js/session_auto_close.esm.js",
        ],
    },
}
