{
    'name' : 'Fast languages switcher',
    'version': '1.0',
    'author': 'ThinkOpen Solutions',
    'category': 'Tools',
    'complexity': 'easy',
    'website': 'https://thinkopen.solutions',
    'data': [
        'views/templates.xml',
    ],
    'depends' : ['base', 'web'],
    'qweb': ['static/src/xml/*.xml'],
    'application': False,
    'installable': True,
    'auto_install': False,
}
