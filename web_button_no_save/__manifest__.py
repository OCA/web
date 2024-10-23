#  Copyright 2022 Simone Rubino - TAKOBI
#  License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Button No Save",
    "summary": "define buttons that do not require saving the form",
    "version": "15.0.1.0.0",
    "development_status": "Beta",
    "author": "TAKOBI, " "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Web",
    "depends": [
        "web",
    ],
    "assets": {
        "web.assets_backend": [
            "web_button_no_save/static/src/js/*.js",
        ],
        "web.qunit_suite_tests": [
            "web_button_no_save/static/tests/*.js",
        ],
    },
}
