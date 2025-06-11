{
    "name": "Web Edit XML ID",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "category": "Base",
    "website": "https://github.com/OCA/web",
    "development_status": "Production/Stable",
    "author": "DEC, Odoo Community Association (OCA)",
    "maintainers": ["ypapouin"],
    "depends": [
        "web",
    ],
    "data": [],
    "qweb": [],
    "assets": {
        "web.assets_backend": [
            "web_edit_xmlid/static/src/core/**/*",
            "web_edit_xmlid/static/src/views/**/*",
        ],
    },
    "installable": True,
}
