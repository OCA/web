# Copyright 2026 Altixia (https://www.altixia.com)
# @author: Claude Perrin <claude@altixia.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Timezone Auto",
    "summary": "Keep each user's time zone in line with the device they use",
    "version": "18.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Altixia, Odoo Community Association (OCA)",
    "maintainers": ["klodr"],
    "license": "AGPL-3",
    "development_status": "Beta",
    "depends": ["web"],
    "data": [
        "views/res_users_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_timezone_auto/static/src/timezone_service.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_timezone_auto/static/tests/**/*",
        ],
    },
    "installable": True,
}
