# Copyright 2026 Domatix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Grid View",
    "summary": "2D grid view for Odoo",
    "version": "19.0.1.0.0",
    "development_status": "Alpha",
    "author": "Domatix, Odoo Community Association (OCA)",
    "category": "Hidden",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "demo": [
        "demo/ir_cron_view.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_grid_view/static/src/views/grid/grid_view.scss",
            "web_grid_view/static/src/views/grid/grid_renderer.scss",
            "web_grid_view/static/src/hooks/input_hook.esm.js",
            "web_grid_view/static/src/components/grid_cell.esm.js",
            "web_grid_view/static/src/components/grid_cell.xml",
            "web_grid_view/static/src/components/grid_component.esm.js",
            "web_grid_view/static/src/components/grid_component.xml",
            "web_grid_view/static/src/components/grid_row.esm.js",
            "web_grid_view/static/src/components/grid_row.xml",
            "web_grid_view/static/src/components/many2one_grid_row.esm.js",
            "web_grid_view/static/src/components/many2one_grid_row.xml",
            "web_grid_view/static/src/components/float_factor_grid_cell.esm.js",
            "web_grid_view/static/src/components/float_time_grid_cell.esm.js",
            "web_grid_view/static/src/components/float_toggle_grid_cell.esm.js",
            "web_grid_view/static/src/components/float_toggle_grid_cell.xml",
            "web_grid_view/static/src/views/grid/grid_arch_parser.esm.js",
            "web_grid_view/static/src/views/grid/grid_model.esm.js",
            "web_grid_view/static/src/views/grid/grid_renderer.esm.js",
            "web_grid_view/static/src/views/grid/grid_renderer.xml",
            "web_grid_view/static/src/views/grid/grid_controller.esm.js",
            "web_grid_view/static/src/views/grid/grid_controller.xml",
            "web_grid_view/static/src/views/grid/grid_view.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_grid_view/static/tests/grid_view.test.js",
        ],
    },
    "installable": True,
    "application": False,
}
