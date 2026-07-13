# Copyright 2024 TechnoLibre - Manel Guechetouli
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Diagram Builder",
    "version": "17.0.1.0.0",
    "category": "Tools",
    "summary": "Build recursive dependency diagrams from any many2one field",
    "author": "TechnoLibre, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "development_status": "Beta",
    "maintainers": ["mmaanneell"],
    "depends": ["web_diagram"],
    "post_init_hook": "post_init_hook",
    "data": [
        "security/ir.model.access.csv",
        "data/web_diagram_builder_template_data.xml",
        "data/web_diagram_builder_guide_data.xml",
        "data/ir_cron_data.xml",
        "views/web_diagram_builder_template_views.xml",
        "views/web_diagram_builder_help_views.xml",
        "views/web_diagram_builder_views.xml",
        "views/web_diagram_builder_node_views.xml",
        "views/web_diagram_builder_link_views.xml",
        "views/web_diagram_builder_import_views.xml",
        "views/web_diagram_builder_import_result_views.xml",
        "views/web_diagram_builder_import_report_views.xml",
        "views/web_diagram_builder_path_views.xml",
        "views/menu.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_diagram_builder/static/src/xml/diagram_help_widget.xml",
            "web_diagram_builder/static/src/js/diagram_help_widget.js",
        ],
    },
    "installable": True,
    "application": True,
}
