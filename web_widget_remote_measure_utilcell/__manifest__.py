# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Remote UTILCELL scales",
    "summary": "Compatibility with UTILCELL propietary protocols",
    "version": "15.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "maintainers": ["chienandalu"],
    "license": "AGPL-3",
    "category": "Stock",
    "depends": ["web_widget_remote_measure"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_widget_remote_measure_utilcell/static/src/js/*.js",
        ],
    },
}
