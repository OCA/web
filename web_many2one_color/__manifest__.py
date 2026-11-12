# Copyright 2026 glueckkanja AG
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Web Many2one Color State",
    "summary": "Color the selected value of many2one fields "
    "depending on a color state of the target record",
    "version": "19.0.1.0.0",
    "category": "Web",
    "author": "glueckkanja AG, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "maintainers": ["CRogos"],
    "depends": ["web"],
    "assets": {
        "web.assets_backend": ["web_many2one_color/static/src/**/*"],
        "web.assets_unit_tests": ["web_many2one_color/static/tests/**/*.test.js"],
    },
    "installable": True,
}
