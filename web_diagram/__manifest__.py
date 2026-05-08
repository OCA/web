# Copyright 2024 TechnoLibre - Manel Guechetouli
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Odoo Web Diagram",
    "version": "18.0.1.0.0",
    "category": "Hidden",
    "summary": "Interactive diagram view for Odoo using Cytoscape.js",
    "author": "TechnoLibre, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "post_init_hook": "post_init_hook",
    "data": [
        "security/ir.model.access.csv",
        "views/diagram_nav_help_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_diagram/static/lib/js/cytoscape.min.js",
            "web_diagram/static/lib/js/dagre.min.js",
            "web_diagram/static/lib/js/cytoscape-dagre.min.js",
            "web_diagram/static/src/scss/diagram_view.scss",
            "web_diagram/static/src/js/diagram_model.js",
            "web_diagram/static/src/js/diagram_controller.js",
            "web_diagram/static/src/js/diagram_renderer.js",
            "web_diagram/static/src/js/diagram_view.js",
            "web_diagram/static/src/xml/base_diagram.xml",
        ],
        "web.assets_unit_tests": [
            "web_diagram/static/tests/diagram_tests.js",
        ],
    },
    "auto_install": True,
}
