# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# Copyright 2018 Brainbean Apps
# Copyright 2020 CorporateHub (https://corporatehub.eu)
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

{
    "name": "Web Actions View Reload",
    "summary": "Enables reload of the current view via ActionManager",
    "category": "Web",
    "version": "15.0.1.0.0",
    "license": "LGPL-3",
    "author": "Modoolar, CorporateHub, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_ir_actions_act_view_reload/static/src/**/*.esm.js",
        ]
    },
    "installable": True,
}
