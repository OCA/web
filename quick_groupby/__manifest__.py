# -*- coding: utf-8 -*-
{
    "name": "List View Column Group By Header Button",
    "version": "17.0.1.0.0",
    "summary": "Add a small group-by toggle to groupable list/tree column headers.",
    "description": """
Globally adds a compact group-by button to list (tree) view column headers.
Clicking it reloads the list view grouped by that column. The button only
appears for groupable fields (excludes x2many fields and non-stored computed
fields when field metadata is available).
""",
    "category": "Tools",
    "author": "MD Jafor Sadek Khan rksadeck@gmail.com",
    "maintainer": "MD Jafor Sadek Khan rksadeck@gmail.com",
    "website": "https://github.com/<your-github>/quick_groupby",
    "license": "AGPL-3",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "quick_groupby/static/src/xml/list_header_cell.xml",
            "quick_groupby/static/src/js/list_header_cell.js",
        ],
    },
    "images": ["static/description/icon.png"],
    "installable": True,
    "application": False,
    "auto_install": False,
}
