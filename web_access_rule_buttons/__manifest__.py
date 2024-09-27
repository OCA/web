# Copyright 2016 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Access Rules Buttons",
    "summary": "Disable Edit button if access rules prevent this action",
    "version": "15.0.1.0.0",
    "author": "Camptocamp, Onestein, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Web",
    "depends": [
        "web",
    ],
    "website": "https://github.com/OCA/web",
    "assets": {
        "web.assets_backend": [
            "web_access_rule_buttons/static/src/**/*.js",
        ],
        "web.qunit_suite_tests": [
            "web_access_rule_buttons/static/tests/**/*.js",
        ],
    },
    "installable": True,
}
