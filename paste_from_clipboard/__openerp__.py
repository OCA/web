{
    'name': 'paste_from_clipboard',
    'category': 'Hidden',
    'version': '1.0',
    'author': 'szufisher'
    'description':
        """


        """,
    'depends': ['web'],
    'auto_install': False,
    'data': [
        'views/paste_from_clipboard.xml',
    ],
    'qweb' : [
        "static/src/xml/*.xml",
    ],
}
