# Copyright 2023 Kencove (https://kencove.com).
# @author Mohamed Alkobrosli <malkobrosly@kencove.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Export JSON",
    "summary": "Export Data in JSON Format",
    "version": "16.0.1.0.0",
    "category": "Uncategorized",
    "website": "https://github.com/OCA/web",
    "author": "Kencove, Odoo Community Association (OCA)",
    "maintainers": ["Kencove"],
    "license": "AGPL-3",
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_export_json/static/src/action_ir_export.xml",
            "web_export_json/static/src/action_ir_export.esm.js",
        ],
    },
}
