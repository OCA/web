# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "JSGantt View",
    "summary": "Add a Gantt view type using jsgantt-improved",
    "version": "16.0.1.0.0",
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
            "web_view_jsgantt/static/lib/jsgantt-improved/dist/*",
            "web_view_jsgantt/static/src/views/**/*",
        ],
    },
}
