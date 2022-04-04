{
    'name': "UOM View Precision Widget",

    'summary': """
        This module allows to set the precision of the UOM in the view.
    """,

    "author": "Yiğit Budak, "
              "Odoo Community Association (OCA)",
    'website': "https://github.com/oca/web",

    "license": "AGPL-3",
    "category": "Web",
    'version': '12.0.1.0.0',

    'depends': ['base', 'stock', 'web'],

    'data': [
        'views/web_widget_uom_precision_view.xml',
        'views/uom_uom_view.xml',
    ]
}
