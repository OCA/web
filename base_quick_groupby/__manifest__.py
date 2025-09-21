{
    "name": "List View Column Group By Header Button",
    "version": "17.0.1.0.0",
    "summary": "Add a small group-by toggle to groupable list/tree column headers.",
    "category": "Tools",
    "author": "MD Jafor Sadek Khan, Odoo Community Association (OCA)",
    "maintainer": "MD Jafor Sadek Khan <rksadeck@gmail.com>",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "base_quick_groupby/static/src/xml/list_header_cell.xml",
            "base_quick_groupby/static/src/js/list_header_cell.esm.js",
        ],
    },
    "images": ["static/description/icon.png"],
    "installable": True,
    "application": False,
    "auto_install": False,
}
