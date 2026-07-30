# Copyright 2024 Tecnativa - David Vidal
# Copyright 2026 Therp Bv
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Filter Button",
    "version": "16.0.1.0.0",
    "summary": "Show selected filters as buttons in the control panel",
    "author": "Tecnativa, Therp Bv, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Server UX",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "demo": [
        "demo/ir_module_module_view.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_filter_header_button/static/src/control_panel/control_panel_patch.js",
            "web_filter_header_button/static/src/control_panel/control_panel.xml",
            "web_filter_header_button/static/src/filter_button/filter_header_buttons.scss",
            "web_filter_header_button/static/src/filter_button/filter_button.js",
            "web_filter_header_button/static/src/filter_button/filter_button.xml",
            "web_filter_header_button/static/src/search/search_model_patch.js",
            "web_filter_header_button/static/src/search/search_arch_parser_patch.js",
        ],
    },
    "installable": True,
}
