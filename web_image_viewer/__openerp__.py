{
    'name': 'Image Viewer',
    'author': 'Hoang Phan, pquochoang2007@gmail.com',
    'category': 'Hidden',
    'version': '1.0',
    'description': """ """,
    'depends': ['base', 'web'],
    'auto_install': True,
    'data': [
        'views/image_viewer.xml',
    ],
    'qweb': [
        "static/src/xml/*.xml",
    ],
}
