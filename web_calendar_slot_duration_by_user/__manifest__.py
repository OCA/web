# Copyright 2024 Nomadi Plus Tecnologia LTDA - Italo LOPES
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Calendar slot duration by user",
    "summary": "Customizable calendar slot durations by user",
    "version": "16.0.1.0.1",
    "category": "Extra Tools",
    "website": "https://github.com/OCA/web",
    "author": "Italo LOPES (Nomadi Plus), Odoo Community Association (OCA)",
    "maintainers": ["imlopes"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "data": ["views/res_users.xml"],
    "assets": {
        "web.assets_backend": [
            "web_calendar_slot_duration_by_user/static/src/js/calendar_model.esm.js",
        ]
    },
    "depends": ["web_calendar_slot_duration"],
}
