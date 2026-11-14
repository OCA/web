# Copyright 2026 - TODAY, Cristiano Mafra Junior <cristiano.mafra@escodoo.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Web x2many Delete Confirmation",
    "summary": "Ask for confirmation before removing a line from an "
    "x2many list, configurable per model",
    "version": "18.0.1.0.0",
    "development_status": "Alpha",
    "author": "Escodoo, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Web",
    "maintainers": ["CristianoMafraJunior"],
    "depends": ["web"],
    "data": [
        "security/ir.model.access.csv",
        "views/x2many_delete_confirm_rule_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "web_x2many_delete_confirm/static/src/**/*.esm.js",
        ],
        "web.assets_unit_tests": [
            "web_x2many_delete_confirm/static/tests/**/*",
        ],
    },
    "installable": True,
}
