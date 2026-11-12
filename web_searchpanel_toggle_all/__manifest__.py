# Copyright 2026 Le Filament (<https://le-filament.com>)
{
    "name": "Web Searchpanel Toggle All",
    "summary": "Toggle all checkboxes in searchpanel filter in mode 'multi'.",
    "version": "18.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "Odoo Community Association (OCA), Le Filament",
    "maintainers": ["Hugo-Trentesaux"],
    "license": "AGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_searchpanel_toggle_all/static/src/search_panel.esm.js",
            "web_searchpanel_toggle_all/static/src/search_panel.xml",
        ],
    },
    "installable": True,
    "application": False,
}
