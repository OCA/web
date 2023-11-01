# Copyright 2023 gpothier
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Responsive Apps Menu for Enterprise",
    "summary": "Enables the Web Responsive modeule's Apps Menu in Enterprise Edition",
    "version": "16.0.1.0.0",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "author": "gpothier, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "installable": True,
    "depends": ["web_enterprise", "web_responsive"],
    "development_status": "Production/Stable",
    "assets": {
        "web.assets_backend": [
            "/web_responsive_enterprise/static/src/components/apps_menu/apps_menu.esm.js",
        ],
    },
    "sequence": 1,
}
