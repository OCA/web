# Copyright 2019 Onestein
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Edit User Filters",
    "category": "Extra Tools",
    "version": "15.0.1.0.0",
    "author": "Onestein,Level Prime Srl,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "development_status": "Production/Stable",
    "license": "AGPL-3",
    "depends": ["web"],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "web_edit_user_filter/static/src/js/*.js",
            "web_edit_user_filter/static/src/scss/*.scss",
        ],
        "web.assets_qweb": [
            "web_edit_user_filter/static/src/xml/*.xml",
        ],
    },
}
