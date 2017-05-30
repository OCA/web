# -*- coding: utf-8 -*-

{
    'name': 'Web product variante selector',
    'version': '10.0.1.0.0',
    'license': 'AGPL-3',
    'author': "Florent de Labarre, Odoo Community Association (OCA)",
    'website': 'https://github.com/fmdl',
    'summary': 'Web product variante selector',
    'category': 'Product',
    'depends': ['product', 'web', ],
    'data': [
        'views/web_product_variante_selector.xml',
        'wizard/wizard_product_variante_selector.xml',
    ],
    'installable': True,
}
