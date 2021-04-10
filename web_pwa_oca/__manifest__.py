# Copyright 2020 Lorenzo Battistini @ TAKOBI
# Copyright 2020 Tecnativa - Alexandre D. Díaz
# Copyright 2020 Tecnativa - João Marques
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Progressive web application",
    "summary": "Make Odoo a PWA",
    "version": "12.0.3.2.0",
    "development_status": "Beta",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "author": "TAKOBI, Tecnativa, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "LGPL-3",
    "application": True,
    "installable": True,
    "depends": [
        'web',
        'mail',
    ],
    "data": [
        "templates/assets.xml",
        "views/res_config_settings_views.xml",
    ],
    'images': ['static/description/pwa.png'],
}
