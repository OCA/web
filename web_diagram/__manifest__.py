# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Odoo Web Diagram',
    'category': 'Hidden',
    'description': """
Openerp Web Diagram view.
=========================

""",
    'version': "15.0.1.0.0",
    'depends': ['web'],
    'data': [
        'security/ir.model.access.csv',
        'views/diagram_nav_help_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'web_diagram/static/src/scss/diagram_view.scss',
            # Cytoscape + dagre must load in this order (global scripts)
            'web_diagram/static/lib/js/dagre.min.js',
            'web_diagram/static/lib/js/cytoscape.min.js',
            'web_diagram/static/lib/js/cytoscape-dagre.min.js',
            'web_diagram/static/src/js/diagram_model.js',
            'web_diagram/static/src/js/diagram_controller.js',
            'web_diagram/static/src/js/diagram_renderer.js',
            'web_diagram/static/src/js/diagram_view.js',
            'web_diagram/static/src/js/view_registry.js',
        ],
        'web.assets_qweb': [
            'web_diagram/static/src/xml/base_diagram.xml',
        ],
        'web.qunit_suite_tests': [
            'web_diagram/static/tests/diagram_tests.js',
        ],
    },
    'auto_install': True,
    'license': 'LGPL-3',
}
