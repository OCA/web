# Copyright 2024 Tecnativa - Sergio Teruel
# Copyright 2024 Odoo S.A.
# License AGPLv3.0 or later (https://www.gnu.org/licenses/agpl-3.0.en.html).

{
    "name": "Web Actions Multi Print",
    "summary": "Enables multi print actions",
    "category": "Web",
    "version": "15.0.1.0.0",
    "license": "LGPL-3",
    "author": "Odoo S.A., Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_ir_actions_multi_print/static/src/js/multi_print.esm.js",
        ],
    },
    "installable": True,
}
