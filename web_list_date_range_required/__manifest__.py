# Copyright 2026 Heligrafics Fotogrametria S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "List View with Required Date Range",
    "summary": "List view that asks for a date range before loading any record",
    "version": "17.0.1.0.0",
    "development_status": "Beta",
    "category": "Web",
    "author": "Heligrafics Fotogrametria S.L., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "maintainers": ["zamberjo"],
    "depends": ["web"],
    "demo": ["demo/res_partner_demo.xml"],
    "assets": {
        "web.assets_backend": [
            "web_list_date_range_required/static/src/date_range_dialog/date_range_dialog.esm.js",
            "web_list_date_range_required/static/src/date_range_dialog/date_range_dialog.xml",
            "web_list_date_range_required/static/src/date_range_list/date_range_search_model.esm.js",
            "web_list_date_range_required/static/src/date_range_list/date_range_list_view.esm.js",
            "web_list_date_range_required/static/src/date_range_list/date_range_list_view.xml",
        ],
        "web.qunit_suite_tests": [
            "web_list_date_range_required/static/tests/date_range_dialog_tests.esm.js",
            "web_list_date_range_required/static/tests/date_range_list_view_tests.esm.js",
        ],
    },
    "installable": True,
}
