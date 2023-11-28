# Copyright 2023 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Calendar Event Type Color",
    "summary": "Colorize calendar view depending on event type color",
    "version": "16.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "maintainers": ["yankinmax"],
    "license": "AGPL-3",
    "category": "Usability",
    "depends": ["calendar"],
    "data": ["views/calendar_event_type_views.xml", "views/calendar_event_views.xml"],
    "assets": {
        "web.assets_backend": [
            "web_calendar_event_type_color/static/src/views/**/*",
        ]
    },
}
