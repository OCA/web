# Copyright 2015 0k.io
# Copyright 2016 ACSONE SA/NV
# Copyright 2017 Tecnativa
# Copyright 2020 initOS GmbH.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "web_m2x_options",
    "version": "15.0.1.1.0",
    "category": "Web",
    "author": "initOS GmbH,"
    "ACSONE SA/NV, "
    "0k.io, "
    "Tecnativa, "
    "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_m2x_options/static/src/js/form.js",
            "web_m2x_options/static/src/js/ir_options.js",
        ],
        "web.assets_qweb": ["web_m2x_options/static/src/xml/base.xml"],
    },
    "installable": True,
}
