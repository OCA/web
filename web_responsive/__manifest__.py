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
    "data": [
        "views/res_users_views.xml",
    ],
    "assets": {
        "web._assets_primary_variables": [
            (
                "before",
                "web/static/src/**/*.variables.scss",
                "web_responsive/static/src/**/*.variables.scss",
            ),
            "/web_responsive/static/src/scss/primary_variable.scss",
        ],
        "web.assets_backend": [
            "web_responsive/static/src/lib/fuse/fuse.basic.min.js",
            "/web_responsive/static/src/scss/*.scss",
            "/web_responsive/static/src/js/*.js",
            "web_responsive/static/src/core/**/*",
            "web_responsive/static/src/search/**/*",
            "web_responsive/static/src/views/**/*",
            "web_responsive/static/src/webclient/**/*",
            "/web_responsive/static/src/components/apps_menu_tools.esm.js",
            "/web_responsive/static/src/components/apps_menu/*",
            "/web_responsive/static/src/components/apps_menu_item/*",
            "/web_responsive/static/src/components/menu_canonical_searchbar/*",
            "/web_responsive/static/src/components/menu_odoo_searchbar/*",
            "/web_responsive/static/src/components/menu_fuse_searchbar/*",
            "/web_responsive/static/src/components/menu_searchbar/*",
            "/web_responsive/static/src/components/file_viewer/*",
            "/web_responsive/static/src/chatter/**/*",
            "/web_responsive/static/src/components/control_panel/*",
            "/web_responsive/static/src/components/command_palette/*",
            # Don't include dark mode files in light mode
            ("remove", "web_responsive/static/src/**/*.dark.scss"),
        ],
        "web.assets_web_dark": [
            "web_responsive/static/src/**/*.dark.scss",
        ],
        "web.assets_clickbot": [
            "/web_responsive/static/src/clickbot/clickbot.esm.js",
        ],
        "web.qunit_suite_tests": [
            "/web_responsive/static/tests/apps_menu_tests.esm.js",
            "/web_responsive/static/tests/apps_menu_search_tests.esm.js",
        ],
    },
    "sequence": 1,
}
