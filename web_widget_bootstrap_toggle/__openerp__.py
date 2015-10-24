# -*- encoding: utf-8 -*-
{
    'name': 'web_widget_bootstrap_toggle',
    'version': '8.0',
    'summary': 'Odoo Checkbox Widget',
    'category': 'Tools',
    'description':
        """
Boolean Bootstrap Toggle Widget
=================
        """,
    'data': [
        "views/users.xml",
        "toggle_widget.xml",
    ],
    'depends': ['base'],
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
}
