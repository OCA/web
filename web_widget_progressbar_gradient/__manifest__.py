# Copyright 2024 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Widget Progressbar Gradient",
    "summary": """This module allows to display progressbar with gradient""",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "maintainers": ["rousseldenis"],
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_progressbar_gradient/static/src/scss/progressbar.scss",
            "web_widget_progressbar_gradient/static/src/xml/progressbar.xml",
            "web_widget_progressbar_gradient/static/src/js/progressbar.esm.js",
        ],
    },
}
