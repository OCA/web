# Copyright 2026 OpenFire
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Button Box Options",
    "version": "16.0.1.0.0",
    "category": "Web",
    "author": "OpenFire, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_button_box_options/static/src/views/form/button_box/button_box_patch.esm.js",
        ],
    },
    "data": [
        "data/ir_config_parameter.xml",
    ],
    "installable": True,
}
