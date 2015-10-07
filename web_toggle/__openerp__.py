# -*- coding: utf-8 -*-
{
    'name' : 'Bootstrap Toggle Widget',
    'version': '1.0',
    'summary': 'Odoo Checkbox Widget',
    'category': 'Tools',
    'description':
        """
Checkbox Toggle Widget
=================
        """,
    'data': [
        "toggle_widget.xml",
    ],
    'depends' : ['base'],
    'qweb': ['static/src/xml/*.xml'],
    'application': True,
}
