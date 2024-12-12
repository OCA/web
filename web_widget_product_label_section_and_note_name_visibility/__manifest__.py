{
    "name": "Web widget product label section and note",
    "version": "16.0.1.0.1",
    "summary": "unify the product and name into a single column",
    "author": "Tecnativa, Odoo Community Association (OCA), Odoo S.A.",
    "website": "https://github.com/OCA/web",
    "depends": [
        "web",
        "account",
    ],
    "data": [
        "views/account_move_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_widget_product_label_section_and_note/static/src/core/utils/**/*",
            "web_widget_product_label_section_and_note/static/src/components/**/*",
        ],
    },
    "installable": True,
    "auto_install": False,
    "license": "AGPL-3",
}
