# Copyright 2025 Heligrafics Fotogrametria S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Bus Record Events",
    "summary": "Refresh open views when records change, through the bus",
    "version": "18.0.1.0.0",
    "category": "Web",
    "author": "Heligrafics Fotogrametria S.L., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": [
        "bus",
        "web",
    ],
    "data": [
        "data/ir_cron.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "bus_record_events/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "bus_record_events/static/tests/**/*",
        ],
    },
    "installable": True,
}
