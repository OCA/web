# -*- coding: utf-8 -*-
{
    "name" : "Web Gestures Support",
    "version" : "10.0.1.0.0",
    "author" : "Callino, Wolfgang Pichler"
               "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": 'Web',
    'complexity': "easy",
    'depends': ['web'],
    "summary": """
        This module does provide gesture support for odoo
        It does support:
         * Swipe in form view to get to the next / previous record
    """,
    'data': [
        'views/assets.xml',
    ],
    'website': 'http://www.callino.at',
    'installable': True,
    'auto_install': False,
}
