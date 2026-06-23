# Copyright 2026 QoQa Services SA
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

{
    "name": "Filter Multiline Paste",
    "category": "Hidden/Tools",
    "version": "18.0.1.0.0",
    "license": "LGPL-3",
    "author": "QoQa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_filter_paste_multiline/static/src/list_paste_multiline.esm.js",
            "web_filter_paste_multiline/static/src/list_paste_multiline.xml",
        ],
        "web.assets_unit_tests": [
            "web_filter_paste_multiline/static/tests/*",
        ],
    },
}
