# Copyright 2025 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Widget Popover",
    "summary": "Render an icon that displays the field content in a popover",
    "version": "18.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "maintainers": ["ivantodorovich"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_widget_popover/static/src/**/*.js",
            "web_widget_popover/static/src/**/*.xml",
        ],
    },
}
