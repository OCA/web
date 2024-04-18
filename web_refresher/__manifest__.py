{
    "name": "Web Refresher",
    "version": "16.0.3.0.0",
    "author": "Compassion Switzerland, Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "auto_install": False,
    "assets": {
        "web.assets_backend": [
            "web_refresher/static/src/**/*.scss",
            "web_refresher/static/src/**/*.esm.js",
            "web_refresher/static/src/**/*.xml",
        ],
    },
}
