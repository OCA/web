# Copyright 2016-2017 LasLabs Inc.
# Copyright 2017-2018 Tecnativa - Jairo Llopis
# Copyright 2018-2019 Tecnativa - Alexandre Díaz
# Copyright 2021 ITerra - Sergey Shebanin
# Copyright 2023 Onestein - Anjeel Haria
# Copyright 2023 Taras Shabaranskyi
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    "name": "Web Responsive",
    "summary": "Responsive web client, community-supported",
    "version": "19.0.1.1.0",
    "category": "Website",
    "website": "https://github.com/OCA/web",
    "author": "LasLabs, Tecnativa, ITerra, Onestein, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "installable": True,
    "depends": ["web", "web_tour", "mail"],
    "development_status": "Production/Stable",
    "maintainers": ["Tardo", "SplashS"],
    "excludes": ["web_enterprise"],
    "assets": {
        "web._assets_primary_variables": [
            (
                "before",
                "web/static/src/**/*.variables.scss",
                "web_responsive/static/src/**/*.variables.scss",
            ),
            # These depend on web/static/src/webclient/navbar/navbar.variables.scss
            # so we need to add them after the variables.scss files.
            # Another option would be to add them to the web._assets_secondary_variables
            # bundle but I feel they still belong in the primary bundle.
            "web_responsive/static/src/**/*.post_variables.scss",
        ],
        "web.assets_backend": [
            "web_responsive/static/src/core/**/*",
            "web_responsive/static/src/search/**/*",
            "web_responsive/static/src/views/**/*",
            "web_responsive/static/src/webclient/**/*",
            "/web_responsive/static/src/chatter/**/*",
            # Don't include dark mode files in light mode
            ("remove", "web_responsive/static/src/**/*.dark.scss"),
        ],
        "web.assets_web_dark": [
            (
                "before",
                "web_responsive/static/src/**/*.post_variables.scss",
                "web_responsive/static/src/**/*.post_variables.dark.scss",
            ),
        ],
        "web.assets_clickbot": [
            "/web_responsive/static/src/clickbot/clickbot.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_responsive/static/tests/**/*.test.js",
        ],
    },
    "sequence": 1,
}
