# -*- coding: utf-8 -*-

{
    'name': 'web_m2x_options',
    'version': "10.0.1.0.0",
    'category': 'Web',
    'depends': [
        'base',
        'web',
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    'license': 'AGPL-3',
    'data': [
        'data/config_data.xml',
        'views/view.xml',
    ],
    "author": "Henry Zhou, ACSONE SA/NV, 0k.io,Odoo Community Association (OCA)",
    'installable': True,
}
