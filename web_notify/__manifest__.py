# pylint: disable=missing-docstring
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Notify",
    "summary": """
        Send notification messages to user""",
    "version": "15.0.1.0.1",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV," "AdaptiveCity,""cozybizs", "Odoo Community Association (OCA)",
    "development_status": "Production/Stable",
    "website": "https://github.com/OCA/web",
    "depends": ["web", "bus", "base"],
    "data": [
                # "views/web_notify.xml"
        ],
    "demo": [
                "views/res_users_demo.xml"
        ],
    'assets': {
        'mail.assets_discuss_public': [
            '/web_notify/static/src/scss/webclient.scss',
        ],
        'web.assets_backend': [
            '/web_notify/static/src/js/web_client.js',
            '/web_notify/static/src/js/widgets/notification.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
