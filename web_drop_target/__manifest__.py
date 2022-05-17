# Copyright 2018 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Drop target support",
    "version": "15.0.1.0.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Allows to drag files into Odoo",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "web_drop_target/static/lib/base64js.min.js",
            "web_drop_target/static/src/js/web_drop_target.js",
            "web_drop_target/static/src/scss/web_drop_target.scss",
        ],
        "web.assets_qweb": ["web_drop_target/static/src/xml/widgets.xml"],
    },
}
