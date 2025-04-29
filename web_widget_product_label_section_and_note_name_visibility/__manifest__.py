{
    "name": "Web widget product label section and note",
    "version": "18.0.1.0.0",
    "summary": "Alternate the visibility of the product and description.",
    "author": "Tecnativa, Odoo Community Association (OCA), Odoo S.A.",
    "website": "https://github.com/OCA/web",
    "depends": [
        "web",
        "account",
    ],
    "assets": {
        "web.assets_backend": [
            (
                "after",
                "account/static/src/components/**/*",
                "web_widget_product_label_section_and_note_name_visibility/static/src/components/**/*",
            )
        ],
    },
    "installable": True,
    "auto_install": False,
    "license": "AGPL-3",
    "maintainers": ["carlos-lopez-tecnativa"],
}
