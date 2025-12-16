{
    "name": "Bus Record Events",
    "version": "17.0.1.0.0",
    "category": "Web",
    "summary": "Broadcast CRUD operations (Create, Write, Unlink) via Odoo "
    "Bus for OWL reactivity.",
    "author": "Heligrafics Fotogrametria S.L., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": [
        "base",
        "bus",
        "web",
    ],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "bus_record_events/static/src/js/services/*.js",
            "bus_record_events/static/src/js/hooks/*.js",
            "bus_record_events/static/src/js/views/form/*.js",
            "bus_record_events/static/src/js/views/kanban/*.js",
            "bus_record_events/static/src/js/views/pivot/*.js",
            "bus_record_events/static/src/js/views/graph/*.js",
            "bus_record_events/static/src/js/views/calendar/*.js",
            "bus_record_events/static/src/js/views/list/*.js",
        ],
        "web.qunit_suite_tests": [
            "web/static/src/legacy/utils.js",
            "web/static/src/legacy/js/**/*",
            ("remove", "web/static/src/legacy/js/libs/**/*"),
            ("remove", "web/static/src/legacy/js/public/**/*"),
            "bus_record_events/static/tests/unit/hooks/*.js",
            "bus_record_events/static/tests/unit/services/*.js",
            "bus_record_events/static/tests/unit/views/*.js",
        ],
    },
    "installable": True,
}
