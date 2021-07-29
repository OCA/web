# -*- coding: utf-8 -*-

{
    "name": 'Web Drag Drop',
    "version": "8.0.1.0.0",
    "category": "Web",
    "summary": """Allows drag drop of files in Odoo""",
    "website": "https://github.com/OCA/web",
    "depends": [
        'web',
    ],
    "license": "AGPL-3",
    'data': [
        'views/web_assets.xml'
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    "author": "Kevin Kamau,"
              "Odoo Community Association (OCA)",
    "installable": True,
}
