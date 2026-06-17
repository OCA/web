# Copyright 2026 Domatix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Dark Mode Responsive",
    "summary": "Dark mode styles for the responsive apps menu",
    "version": "19.0.1.0.0",
    "website": "https://github.com/OCA/web",
    "author": "Domatix, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": ["web_dark_mode", "web_responsive"],
    "installable": True,
    "assets": {
        "web.assets_web_dark": [
            "web_dark_mode_responsive/static/src/**/*.dark.scss",
        ],
    },
}
