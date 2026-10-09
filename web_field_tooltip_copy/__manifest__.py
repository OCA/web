# Copyright 2026 Pol Reig <pol.reig@qubiq.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web Field Tooltip Copy",
    "summary": "Copy technical field names from developer-mode tooltips",
    "version": "18.0.1.0.0",
    "category": "Web",
    "author": "Pol Reig, QubiQ, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            (
                "after",
                "web/static/src/core/tooltip/tooltip_service.js",
                "web_field_tooltip_copy/static/src/tooltip/web_field_tooltip_copy.esm.js",
            ),
            "web_field_tooltip_copy/static/src/tooltip/field_tooltip.xml",
            "web_field_tooltip_copy/static/src/tooltip/web_field_tooltip_copy.scss",
        ],
    },
}
