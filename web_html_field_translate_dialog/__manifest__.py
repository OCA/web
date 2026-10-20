{
    "name": "Web HTML Field Translate Dialog",
    "summary": "Translate HTML fields with a per-language rich-text editor "
    "instead of the technical term-by-term dialog",
    "version": "19.0.1.0.0",
    "category": "Web",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web", "html_editor"],
    "installable": True,
    "auto_install": False,
    "assets": {
        "web.assets_backend": [
            "web_html_field_translate_dialog/static/src/**/*.js",
            "web_html_field_translate_dialog/static/src/**/*.xml",
            "web_html_field_translate_dialog/static/src/**/*.scss",
        ],
        "web.assets_unit_tests": [
            "web_html_field_translate_dialog/static/tests/**/*.test.js",
        ],
    },
}
