{
    "name": "Web Widget Plotly",
    "summary": """Allow to draw plotly charts.""",
    "author": "LevelPrime srl, Odoo Community Association (OCA)",
    "maintainers": ["robyf70"],
    "website": "https://github.com/OCA/web",
    "category": "Web",
    "version": "14.0.1.0.0",
    "depends": ["web"],
    "data": [
        "views/web_widget_plotly_chart.xml",
    ],
    "external_dependencies": {
        "python": ["plotly==5.4.0"],
    },
    "license": "LGPL-3",
}
