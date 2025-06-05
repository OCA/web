# pylint: disable=missing-docstring
# Copyright 2016 ACSONE SA/NV
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Notify",
    "summary": """
        Send notification messages to user""",
    "version": "18.0.1.1.0",
    "license": "LGPL-3",
    "author": "ACSONE SA/NV," "AdaptiveCity," "Odoo Community Association (OCA)",
    "development_status": "Production/Stable",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "bus", "base", "mail"],
    "assets": {
        "web.assets_backend": [
            "web_notify/static/src/js/services/*.js",
        ]
    },
    "demo": ["views/res_users_demo.xml"],
    "installable": True,
}
