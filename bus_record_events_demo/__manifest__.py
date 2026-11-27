{
    "name": "Bus Record Events Demo",
    "version": "17.0.1.0.0",
    "category": "Web",
    "summary": "Demo module for Bus Record Events.",
    "author": "Heligrafics Fotogrametria S.L., Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": [
        "base",
        "bus_record_events",
    ],
    "data": [
        "security/ir.model.access.csv",
        "security/bus_record_events_demo.xml",
        "views/bus_record_event_demo_views.xml",
        "demo/res_users.xml",
        "demo/bus_record_event_demo.xml",
    ],
    "installable": True,
}
