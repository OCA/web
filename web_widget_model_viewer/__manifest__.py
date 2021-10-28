# Copyright 2020 Andrea Piovesana @ Openindustry.it
# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Model viewer widget",
    "summary": "Easily display interactive 3D models on the web & in AR",
    "version": "14.0.1.0.0",
    "development_status": "Beta",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "TAKOBI, Openindustry.it, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "AGPL-3",
    "depends": [
        "web",
    ],
    "data": [
        "views/assets.xml",
    ],
    "qweb": [
        "static/src/xml/*.xml",
    ],
    "application": False,
    "installable": True,
}
