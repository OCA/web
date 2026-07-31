# Copyright 2026 Bruno Corredato Botti
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Required Field Indicator",
    "summary": "Clearer wording and notebook page highlighting for unfilled "
    "required fields",
    "version": "16.0.1.0.0",
    "author": "Bruno Corredato Botti, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Usability",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_required_field_indicator/static/src/scss/"
            "notebook_required_field_indicator.scss",
            "web_required_field_indicator/static/src/js/**/*",
        ],
    },
}
