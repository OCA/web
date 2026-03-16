# Copyright 2026 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Web Concurrent Edit Global Warning",
    "summary": """
        Adds a warning when a record is edited by multiple users at the same time.
    """,
    "version": "16.0.1.0.0",
    "author": "Akretion, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_concurrent_edit_global_warning/static/src/**/*",
        ],
    },
    "maintainers": ["paradoxxxzero"],
    "installable": True,
}
