# Copyright 2024 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Pwa Customize",
    "version": "18.0.1.0.0",
    "summary": "Allows to customize the Progressive Web App (PWA) settings",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "license": "AGPL-3",
    "category": "Website",
    "installable": True,
    "maintainers": ["victoralmau"],
    "data": [
        "views/res_config_settings_views.xml",
        "views/pwa_assets.xml",
    ],
}
