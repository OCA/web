# Copyright 2024 Miika Nissi (https://miikanissi.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Refresher Auto",
    "version": "16.0.1.0.0",
    "category": "Hidden",
    "author": "Geschäftsstelle Sozialinfo, Miika Nissi, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "maintainers": ["miikanissi"],
    "installable": True,
    "application": False,
    "depends": ["web_refresher"],
    "assets": {
        "web.assets_backend": [
            "web_refresher_auto/static/src/xml/refresher.xml",
            (
                "after",
                "web_refresher/static/src/js/control_panel.esm.js",
                "web_refresher_auto/static/src/js/control_panel.esm.js",
            ),
            (
                "after",
                "web_refresher/static/src/js/refresher.esm.js",
                "web_refresher_auto/static/src/js/refresher.esm.js",
            ),
        ],
        "web.qunit_suite_tests": [
            "web_refresher_auto/static/tests/**/*.js",
        ],
    },
}
