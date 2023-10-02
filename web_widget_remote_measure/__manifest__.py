# Copyright 2023 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "Remote Measure Devices Input",
    "summary": "Allows to connect to remote devices to record measures",
    "version": "15.0.1.0.0",
    "author": "Tecnativa, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/web",
    "maintainers": ["chienandalu"],
    "license": "AGPL-3",
    "category": "Stock",
    "depends": ["web", "uom"],
    "data": [
        "views/remote_measure_device_views.xml",
        "views/res_users_views.xml",
        "security/ir.model.access.csv",
    ],
    "assets": {
        "web.assets_backend": [
            "web_widget_remote_measure/static/src/**/*.js",
            "web_widget_remote_measure/static/src/**/*.scss",
        ],
        "web.assets_qweb": ["web_widget_remote_measure/static/src/**/*.xml"],
    },
}
