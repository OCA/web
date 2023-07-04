# Copyright 2016 Onestein (<http://www.onestein.eu>)
# Copyright 2018 Tecnativa - David Vidal
# Copyright 2018 Tecnativa - João Marques
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web Disable Export Group",
    "version": "15.0.2.0.0",
    "license": "AGPL-3",
    "author": "Onestein, Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "category": "Web",
    "depends": ["web"],
    "data": [
        "security/groups.xml",
        "security/ir.model.access.csv",
    ],
    "installable": True,
    "assets": {
        "web.assets_backend": ["/web_disable_export_group/static/src/js/*.js"],
        "web.assets_tests": ["/web_disable_export_group/static/src/tours/*.js"],
        "web.assets_qweb": ["/web_disable_export_group/static/src/xml/**/*"],
    },
}
