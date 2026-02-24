{
    "name": "Web Toggle Chatter",
    "summary": "Toggle chatter in backend form views",
    "version": "18.0.1.0.0",
    "category": "Extra Tools",
    "author": "Vortex Dimensión Digital, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_toggle_chatter/static/src/js/web_toggle_chatter.esm.js",
            "web_toggle_chatter/static/src/xml/web_toggle_chatter.xml",
            "web_toggle_chatter/static/src/scss/web_toggle_chatter.scss",
        ],
        "web.assets_unit_tests": [
            "web_toggle_chatter/static/tests/**/*",
        ],
    },
    "images": [
        "static/description/icon.png",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
}
