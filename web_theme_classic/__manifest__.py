# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# © 2025 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Theme Classic",
    "summary": "Contrasted style on fields to improve the UI.",
    "version": "18.0.1.2.0",
    "author": "GRAP, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Extra Tools",
    "depends": [
        "web",
    ],
    "data": [
        "views/res_users_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_theme_classic/static/src/js/switch_theme.esm.js",
        ],
        "web.assets_web": [
            "/web_theme_classic/static/src/scss/web_theme_classic.scss",
        ],
        "web.assets_web_dark": [
            (
                "before",
                "/web_theme_classic/static/src/scss/web_theme_classic.scss",
                "/web_theme_classic/static/src/scss/web_theme_classic.dark.scss",
            ),
        ],
    },
    "installable": True,
    "application": True,
}
