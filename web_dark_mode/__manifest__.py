# © 2022 Florian Kantelberg - initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Dark Mode",
    "summary": "Enabled Dark Mode for the Odoo Backend",
    "license": "AGPL-3",
    "version": "18.0.1.0.0",
    "website": "https://github.com/OCA/web",
    "author": "initOS GmbH, Odoo Community Association (OCA)",
    "depends": ["web"],
    "excludes": ["web_enterprise"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_dark_mode/static/src/js/switch_item.esm.js",
        ],
        "web.assets_backend_lazy_dark": [
            ("include", "web.assets_variables_dark"),
            ("include", "web.assets_backend_helpers_dark"),
        ],
        "web.assets_variables_dark": [
            (
                "before",
                "web/static/src/scss/primary_variables.scss",
                "web_dark_mode/static/src/scss/primary_variables.dark.scss",
            ),
            (
                "before",
                "web/static/src/scss/secondary_variables.scss",
                "web_dark_mode/static/src/scss/secondary_variables.dark.scss",
            ),
            (
                "before",
                "web/static/src/**/*.variables.scss",
                "web_dark_mode/static/src/**/*.variables.dark.scss",
            ),
        ],
        "web.assets_backend_helpers_dark": [
            (
                "before",
                "web/static/src/scss/bootstrap_overridden.scss",
                "web_dark_mode/static/src/scss/bootstrap_overridden.dark.scss",
            ),
            (
                "after",
                "web/static/lib/bootstrap/scss/_functions.scss",
                "web_dark_mode/static/src/scss/bs_functions_overrides.dark.scss",
            ),
        ],
        "web.assets_web_dark": [
            ("include", "web.assets_variables_dark"),
            ("include", "web.assets_backend_helpers_dark"),
            "web_dark_mode/static/src/**/*.dark.scss",
        ],
    },
    "data": [
        "views/res_users_views.xml",
    ],
}
