{
    "name": "Web Widget JSON Graph",
    "version": "15.0.1.0.0",
    "author": "Vauxoo, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "category": "Hidden/Dependency",
    "website": "https://github.com/OCA/web",
    "maintainers": [
        "luisg123v",
        "frahikLV",
    ],
    "summary": "Draw json fields with graphs.",
    "depends": [
        "web",
    ],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_widget_json_graph/static/src/js/web_widget_json_graph.js",
        ],
        "web.assets_qweb": [
            "web_widget_json_graph/static/src/xml/web_widget_json_graph.xml",
        ],
    },
    "auto_install": False,
    "installable": True,
    "application": False,
}
