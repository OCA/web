# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Odoo Web Diagram',
    'category': 'Hidden',
    'description': """
Openerp Web Diagram view.
=========================

""",
    'version': "18.0.1.0.0",
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'web_diagram/static/lib/js/raphael.js',
            'web_diagram/static/src/scss/diagram_view.scss',
            'web_diagram/static/src/js/vec2.js',
            'web_diagram/static/src/js/graph.js',
            'web_diagram/static/src/js/diagram_model.js',
            'web_diagram/static/src/js/diagram_controller.js',
            'web_diagram/static/src/js/diagram_renderer.js',
            'web_diagram/static/src/js/diagram_view.js',
            'web_diagram/static/src/xml/base_diagram.xml',
        ],
        'web.assets_unit_tests': [
            'web_diagram/static/tests/diagram_tests.js',
        ],
    },
    'auto_install': True,
    'license': 'LGPL-3',
}
