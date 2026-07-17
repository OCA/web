# Copyright 2026 Acsone
# @author Pierre Verkest <pierre.verkest@apycod.fr>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    "name": "Web Company Context Highlight",
    "summary": "Highlight the company switcher when multiple companies are selected",
    "version": "19.0.1.0.0",
    "author": "Acsone, Odoo Community Association (OCA)",
    "maintainers": ["pverkest"],
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "category": "Web",
    "depends": ["web", "base_setup"],
    "data": ["views/res_config_settings_views.xml"],
    "assets": {
        "web.assets_backend": [
            "web_company_context_highlight/static/src/**/*.js",
            "web_company_context_highlight/static/src/**/*.scss",
            "web_company_context_highlight/static/src/**/*.xml",
        ],
        "web.assets_tests": [
            "web_company_context_highlight/static/tests/tours/**/*.js",
        ],
    },
}
