{
    "name": "Web Refresher",
    "version": "15.0.2.0.1",
    "author": "Compassion Switzerland, Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "auto_install": False,
    "assets": {
        "web.assets_backend": [
            "web_refresher/static/src/scss/refresher.scss",
            "web_refresher/static/src/js/client_action_adapter.esm.js",
            "web_refresher/static/src/js/refresher.esm.js",
            "web_refresher/static/src/js/control_panel.esm.js",
        ],
        "web.assets_qweb": [
            "web_refresher/static/src/xml/refresher.xml",
            "web_refresher/static/src/xml/control_panel.xml",
        ],
    },
}
