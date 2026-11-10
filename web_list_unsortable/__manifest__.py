# Copyright 2026 ACSONE SA/NV
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Web List Unsortable",
    "summary": """Introduce an option to make a field unsortable in a list view""",
    "version": "19.0.1.0.0",
    "license": "LGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_list_unsortable/static/src/list_renderer_patch.esm.js",
        ]
    },
}
