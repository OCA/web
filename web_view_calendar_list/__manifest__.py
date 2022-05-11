# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web View Calendar List",
    "summary": """
        Show calendars as a List""",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "author": "Creu Blanca,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_view_calendar_list/static/src/js/**/*",
            "web_view_calendar_list/static/src/scss/**/*",
        ],
    },
}
