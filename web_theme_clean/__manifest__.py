# Copyright 2026 Humanilog (https://humanilog.org)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Web Theme Clean",
    "summary": "Light main navbar for the backend",
    "version": "20.0.1.0.0",
    "category": "Extra Tools",
    "website": "https://github.com/OCA/web",
    "author": "Humanilog, Odoo Community Association (OCA)",
    "maintainers": ["smaddlsoft"],
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web._assets_primary_variables": [
            (
                "after",
                "web/static/src/scss/primary_variables.scss",
                "web_theme_clean/static/src/webclient/navbar/navbar.variables.scss",
            ),
        ],
        "web.assets_backend": [
            "web_theme_clean/static/src/webclient/navbar/navbar.scss",
        ],
    },
}
