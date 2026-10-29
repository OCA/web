# Copyright 2026 Pol Reig <pol.reig@qubiq.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Web One2many Field Name",
    "summary": "Show parent One2many field name in list column tooltips",
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
            "web_one2many_field_name/static/src/web_one2many_field_name/web_one2many_field_name.esm.js",
            "web_one2many_field_name/static/src/web_one2many_field_name/web_one2many_field_name.xml",
            "web_one2many_field_name/static/src/web_one2many_field_name/web_one2many_field_name.scss",
        ],
    },
}
