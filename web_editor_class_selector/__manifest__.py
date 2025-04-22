{
    "name": "Web editor class selector",
    "version": "18.0.1.0.0",
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
            "web_editor_class_selector/static/src/js/css_selector/**/*",
            "web_editor_class_selector/static/src/scss/demo_styles.scss",
            "web_editor_class_selector/static/src/js/fields/**/*",
            "web_editor_class_selector/static/src/js/utils/**/*",
            "web_editor_class_selector/static/src/js/wysiwyg/**/*",
        ],
    },
    "maintainers": ["carlos-lopez-tecnativa"],
    "installable": True,
    "auto_install": False,
    "license": "AGPL-3",
}
