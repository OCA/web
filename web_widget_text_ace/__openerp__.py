# -*- coding: utf-8 -*-

{
    "name": 'Web Ace Editor',
    "version": "9.0.1.0.0",
    "depends": [
        'web',
        'website',
    ],
    "author": "Sudokeys,Odoo Community Association (OCA)",
    "category": "Hidden",
    "installable": True,
    'auto_install': False,
    "data": [
        'views/ir_ui_view_record.xml',
        'views/assets_view.xml',
    ],
    "qweb": [
        'static/src/xml/*.xml',
    ],
}
