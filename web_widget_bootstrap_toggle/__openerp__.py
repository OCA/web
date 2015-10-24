{
    'name' : 'AIM Bootstrap Toggle Widget',
    'version': '1.0',
    'summary': 'Odoo Checkbox Widget',
    'category': 'Tools',
    'description':
        """
AIM Checkbox Toggle Widget
=================
        """,
    'data': [
        "views/users.xml",
        "toggle_widget.xml",
    ],
    'depends' : ['base'],
    'qweb': ['static/src/xml/*.xml'],
    'application': True,
}
