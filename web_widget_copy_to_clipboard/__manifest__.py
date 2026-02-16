# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Web Widget Copy to Clipboard",
    "summary": "Adds a copy to clipboard button to text fields",
    "version": "18.0.1.0.0",
    "category": "Web",
    "author": "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "development_status": "Beta",
    "maintainers": ["Ghostdev9410"],
    "depends": ["web"],
    "data": [],
    "demo": [
        "tests/test_view.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_widget_copy_to_clipboard/static/src/**/*",
        ],
    },
    "installable": True,
    "application": False,
}
