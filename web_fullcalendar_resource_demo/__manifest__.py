# Copyright 2026 Le Filament (https://le-filament.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Fullcalendar Resource - Demo",
    "summary": "Demonstration model and data for the resource calendar view",
    "version": "18.0.1.0.0",
    "author": "Le Filament, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Productivity",
    "development_status": "Beta",
    "depends": [
        "web_fullcalendar_resource",
    ],
    "data": [
        "demo/fc_demo_data.xml",
        "security/ir.model.access.csv",
        "views/fc_demo_views.xml",
    ],
    "demo": [
        "demo/fc_demo_data.xml",
    ],
    "installable": True,
    "application": False,
}
