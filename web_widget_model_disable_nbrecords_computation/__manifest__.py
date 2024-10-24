# Copyright 2020 Andrea Piovesana @ Openindustry.it
# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Domain field widget no computation",
    "summary": "Easily disable nbrecords computation on Domain Fields",
    "version": "14.0.1.0.0",
    "development_status": "Beta",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "maintainers": ["Camptocamp"],
    "license": "AGPL-3",
    "depends": [
        "web",
    ],
    "data": [
        "views/assets.xml",
        "views/res_config_settings_views.xml",
    ],
    "qweb": [
        "static/src/xml/*.xml",
    ],
    "application": False,
    "installable": True,
}
