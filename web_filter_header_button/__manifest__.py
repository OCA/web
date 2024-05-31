# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Filter Button",
    "version": "15.0.1.1.0",
    "summary": "Show selected filters as buttons in the control panel",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Server UX",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "demo": [
        "demo/ir_module_module_view.xml",
    ],
    "assets": {
        "web.assets_backend": ["web_filter_header_button/static/src/**/*.js"],
        "web.assets_qweb": ["web_filter_header_button/static/src/**/*.xml"],
    },
}
