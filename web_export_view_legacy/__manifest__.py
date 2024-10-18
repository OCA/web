# Copyright 2023 Nextev Srl <odoo@nextev.it>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Export Current View Legacy",
    "version": "16.0.1.0.0",
    "category": "Web",
    "author": "Nextev Srl, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "assets": {
        "web.assets_backend": [
            "web_export_view_legacy/static/src/js/controller.esm.js",
            "web_export_view_legacy/static/src/xml/template.xml",
        ],
    },
    "depends": ["web"],
    "installable": True,
}
