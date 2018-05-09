{
    'name': 'web_widget_x2many_2d_matrix example',
    'summary': "A small example on how to use `web_widget_x2many_2d_matrix`.",
    "version": "11.0.1.0.0",
    "author": "Camptocamp, "
              "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Hidden/Dependency",
    "depends": [
        'web_widget_x2many_2d_matrix',
    ],
    "data": [
        'security/ir.model.access.csv',
        'demo/x2m.demo.csv',
        'views/x2m_demo.xml',
        'wizard/x2m_matrix.xml',
    ],
    "installable": True,
}
