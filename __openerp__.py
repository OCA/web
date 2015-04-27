{
    'name': "Web timeline",
    'summary': """
    Interactive visualization chart to visualize events in time
    """,
    "version": "0.1",
    "author": "ACSONE SA/NV",
    "category": "Acsone",
    "website": "http://acsone.eu",
    'depends': ['web', 'project'],
    'qweb': ['static/src/xml/web_timeline.xml'],
    'data': [
        'views/web_timeline.xml',
        'project_view.xml',
    ],
}
