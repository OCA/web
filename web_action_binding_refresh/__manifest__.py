# Copyright 2026 Vauxoo
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Action Binding Refresh",
    "summary": "Show new contextual actions without reloading the browser",
    "version": "19.0.1.0.0",
    "author": "Vauxoo, Odoo Community Association (OCA)",
    "maintainers": ["moylop260"],
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Web",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_action_binding_refresh/static/src/**/*.esm.js",
        ],
    },
}
