{
    "name": "Web Refresher",
    "version": "17.0.1.1.2",
    "author": "Compassion Switzerland, Tecnativa, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "auto_install": False,
    "assets": {
        "web.assets_backend": [
            "web_refresher/static/src/scss/refresher.scss",
            "web_refresher/static/src/xml/refresher.xml",
            # Load the modification of the master template just after it,
            # for having the modification in all the primary extensions.
            # Example: the project primary view.
            (
                "after",
                "web/static/src/search/control_panel/control_panel.js",
                "web_refresher/static/src/js/*.esm.js",
            ),
            (
                "after",
                "web/static/src/search/control_panel/control_panel.xml",
                "web_refresher/static/src/xml/control_panel.xml",
            ),
        ],
    },
}
