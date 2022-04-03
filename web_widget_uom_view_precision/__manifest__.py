# -*- coding: utf-8 -*-
{
    'name': "UOM View Precision Widget",

    'summary': """
        This module allows to set the precision of the UOM in the view.
    """,

    'description': """
        This module provides a widget for quantity fields.
         It formats the value according to the UOM of the product.
    """,

    'author': "Yiğit Budak",
    'website': "https://github.com/oca/web",

    'category': 'Web',
    'version': '12.0.1.0.0',

    'depends': ['base', 'stock'],

    'data': [
        'views/web_widget_uom_precision_view.xml',
        'views/uom_uom_view.xml',
    ]
}
