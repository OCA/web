# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Calendar workdays views",
    "summary": "Adds opt-in Work Week and Work Month calendar scales that hide "
    "weekend days (Saturday and Sunday)",
    "version": "16.0.1.0.0",
    "development_status": "Beta",
    "category": "Extra Tools",
    "website": "https://github.com/OCA/web",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_calendar_workdays/static/src/js/calendar_arch_parser.esm.js",
            "web_calendar_workdays/static/src/js/calendar_renderer.esm.js",
            "web_calendar_workdays/static/src/js/calendar_common_renderer.esm.js",
            "web_calendar_workdays/static/src/js/calendar_controller.esm.js",
            "web_calendar_workdays/static/src/js/calendar_model.esm.js",
            "web_calendar_workdays/static/src/js/calendar_date_picker.esm.js",
        ],
    },
}
