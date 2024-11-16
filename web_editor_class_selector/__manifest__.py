{
    "name": "Web editor class selector",
    "version": "17.0.1.0.0",
    "summary": "",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": [
        "web_editor",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/web_editor_class_views.xml",
        "views/menus.xml",
    ],
    "demo": [
        "demo/web_editor_class_demo.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_editor_class_selector/static/src/js/backend/**/*",
        ],
        "web_editor.backend_assets_wysiwyg": [
            "web_editor_class_selector/static/src/js/odoo-editor/**/*",
            "web_editor_class_selector/static/src/js/wysiwyg/**/*",
            "web_editor_class_selector/static/src/scss/demo_styles.scss",
            "web_editor_class_selector/static/src/xml/**/",
        ],
    },
    "installable": True,
    "auto_install": False,
    "license": "AGPL-3",
}
