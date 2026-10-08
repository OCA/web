# Copyright 2026 volkantasci
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Theme Focus",
    "summary": "Focus theme - larger icons, hidden search, transparent navbar",
    "license": "AGPL-3",
    "version": "19.0.1.0.0",
    "website": "https://github.com/OCA/web",
    "author": "volkantasci, Odoo Community Association (OCA)",
    "maintainers": ["volkantasci"],
    "category": "Extra Tools",
    "depends": ["web", "web_dark_mode", "web_responsive"],
    "excludes": ["web_enterprise"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_theme_focus/static/src/js/app_theme.esm.js",
            "web_theme_focus/static/src/scss/apps_menu.scss",
            "web_theme_focus/static/src/scss/navbar.scss",
        ],
        "web.assets_web_dark": [
            "web_theme_focus/static/src/**/*.dark.scss",
        ],
    },
}
