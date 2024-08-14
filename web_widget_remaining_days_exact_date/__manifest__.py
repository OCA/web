# Copyright 2024 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

{
    "name": "Web Widget Remaining Days Exact Date",
    "summary": "Allows displaying the exact date alongside the remaining days",
    "version": "16.0.1.0.0",
    "development_status": "Alpha",
    "website": "https://github.com/OCA/web",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "maintainers": ["CarlosRoca13"],
    "license": "AGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_remaining_days_exact_date/static/src/remaining_days"
            "/remaining_days.esm.js",
        ],
    },
}
