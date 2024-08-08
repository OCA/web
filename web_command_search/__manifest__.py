{
    "name": "Command Search",
    "version": "16.0.1.0.0",
    "summary": "A customized fuzzy search that integrates with "
    "the main Odoo search engine",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "data": [
        "views/command_search_views.xml",
        "views/command_search_item_views.xml",
        "security/ir.model.access.csv",
    ],
    "assets": {
        "web.assets_backend": [
            "web_command_search/static/src/components/**/*.js",
            "web_command_search/static/src/components/**/*.xml",
        ],
    },
    "application": True,
}
