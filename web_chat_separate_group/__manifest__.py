{
    "name": "Separate group chat",
    "summary": "Separate group chat and direct chat in two categories.",
    "author": "Le Filament, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "depends": ["web", "mail"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_chat_separate_group/static/src/**.js",
            "web_chat_separate_group/static/src/**.xml",
        ],
        "web.assets_unit_tests": [
            "web_chat_separate_group/static/tests/**/*",
        ],
    },
    "installable": True,
    "auto_install": False,
}
