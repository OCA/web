{
    "name": "Show percentage (of total) in groups",
    "summary": "Show the percentage of the total sum in group by rows",
    "author": "Onestein, Odoo Community Association (OCA)",
    "development_status": "Beta",
    "website": "https://github.com/OCA/web",
    "category": "Web",
    "license": "AGPL-3",
    "version": "16.0.1.0.1",
    "depends": [
        "web",
    ],
    "assets": {
        "web.assets_backend": [
            "/web_group_by_percentage/static/src/legacy/js/backend_legacy.js",
            "/web_group_by_percentage/static/src/js/backend.esm.js",
            "/web_group_by_percentage/static/src/xml/list_grouprow_percentage.xml",
            "/web_group_by_percentage/static/src/scss/backend.scss",
        ],
    },
    "installable": True,
}
