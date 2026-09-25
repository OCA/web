# Copyright 2026 Le Filament (https://le-filament.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Fullcalendar Resource",
    "summary": "OWL calendar view with one vertical column per resource "
    "(based on FullCalendar Scheduler plugins)",
    "version": "18.0.1.0.0",
    "author": "Le Filament, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Productivity",
    "development_status": "Beta",
    "depends": [
        "web",
    ],
    "assets": {
        # The Scheduler plugins must be loaded AFTER the FullCalendar core.
        # They self-register on FullCalendar.globalPlugins.
        # Order: premium-common -> resource -> resource-daygrid -> resource-timegrid
        "web.fullcalendar_lib": [
            "web_fullcalendar_resource/static/lib/fullcalendar/premium-common/index.global.js",
            "web_fullcalendar_resource/static/lib/fullcalendar/resource/index.global.js",
            "web_fullcalendar_resource/static/lib/fullcalendar/resource-daygrid/index.global.js",
            "web_fullcalendar_resource/static/lib/fullcalendar/resource-timegrid/index.global.js",
        ],
        "web.assets_backend": [
            "web_fullcalendar_resource/static/src/resource_calendar/**/*",
        ],
    },
    "installable": True,
    "application": False,
}
