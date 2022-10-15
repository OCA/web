# pylint: disable=missing-docstring
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Notify",
    "summary": """
        Send notification messages to user""",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,"
    "AdaptiveCity,"
    "Aswanth Babu S,"
    "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "bus", "base"],
    "assets": {
        "web.assets_backend": [
            "/web_notify/static/src/js/services/web_notification_service.js",
        ]
    },
    "data": ["views/res_users_demo.xml"],
    "installable": True,
}
