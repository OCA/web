# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
{
    "name": "Web Loading Block UI",
    "summary": "Block the screen with a centered loading overlay "
    "while requests are pending",
    "version": "18.0.1.0.0",
    "category": "Web",
    "website": "https://github.com/OCA/web",
    "author": "ForgeFlow, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["web"],
    "data": [
        "data/ir_config_parameter.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_loading_block_ui/static/src/loading_indicator.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_loading_block_ui/static/tests/**/*",
        ],
    },
    "installable": True,
}
