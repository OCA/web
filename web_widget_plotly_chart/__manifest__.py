{
    'name': "Web Widget Plotly",
    'summary': """Allow to draw plotly charts.""",
    'author': "LevelPrime srl, "
              "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    'category': 'Web',
    'version': '12.0.1.0.0',
    'depends': ['web'],
    'data': [
        'views/web_widget_plotly_chart.xml',
    ],
    "external_dependencies": {
        "python": ['plotly'],
    },
    "auto_install": False,
    "license": "LGPL-3",
}
