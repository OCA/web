{
    "name": "Web Widget JSON Graph",
    "version": "12.0.1.0.0",
    "author": "Vauxoo, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "category": "Hidden/Dependency",
    "website": "https://github.com/OCA/web",
    "maintainers": ["luisg123v"],
    "summary": "Draw json fields with graphs.",
    "depends": [
        "web",
    ],
    "data": [
        "views/assets.xml",
    ],
    "qweb": [
        "static/src/xml/web_widget_json_graph.xml",
    ],
    "installable": True,
    "auto_install": False,
    "application": False,
}
