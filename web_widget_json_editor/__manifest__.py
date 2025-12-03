{
    "name": "Web Widget JSON Editor",
    "version": "18.0.1.0.0",
    "category": "Web",
    "summary": "JSON Editor widget for Odoo with schema-based autocomplete",
    "depends": [
        "web",
    ],
    "images": [
        "static/description/screenshot_code_mode.png",
        "static/description/screenshot_view_mode.png",
    ],
    "assets": {
        "web.assets_backend": [
            # JSONEditor library
            "web_widget_json_editor/static/lib/jsoneditor/jsoneditor.min.js",
            "web_widget_json_editor/static/lib/jsoneditor/jsoneditor.min.css",
            "web_widget_json_editor/static/lib/jsoneditor/img/jsoneditor-icons.svg",
            # Field widget
            "web_widget_json_editor/static/src/fields/json_field.esm.js",
            "web_widget_json_editor/static/src/fields/json_field.xml",
            "web_widget_json_editor/static/src/fields/json_field.scss",
            # OWL Component
            "web_widget_json_editor/static/src/components/json_editor/json_editor.esm.js",
            "web_widget_json_editor/static/src/components/json_editor/json_editor.xml",
        ],
    },
    "author": "Apexive Solutions LLC, Odoo Community Association (OCA)",
    "maintainers": ["adar2378"],
    "website": "https://github.com/OCA/web",
    "installable": True,
    "application": False,
    "auto_install": False,
    "license": "LGPL-3",
    "development_status": "Beta",
}
