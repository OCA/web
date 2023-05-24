# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "RTree View",
    "summary": "Add an rtree view type",
    "version": "16.0.0.1.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "development_status": "Alpha",
    "depends": [
        "web",
    ],
    "assets": {
        "web.assets_backend": [
            "web_view_rtree/static/src/views/**/*",
        ],
        "web.qunit_suite_tests": [
            "web_view_rtree/static/tests/*.js",
        ],
    },
}
