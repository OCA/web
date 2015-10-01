# -*- coding: utf-8 -*-
# © <YEAR(S)> <AUTHOR(S)>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web widget boolean switch",
    "summary": "This module add widget to render boolean fields",
    "version": "7.0.1.0.0",
    "category": "web",
    "website": "https://odoo-community.org/",
    "author": "<pverkest@anybox>, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "depends": [
        "base",
        "web",
    ],
    "data": [
    ],
    "js": [
        'static/lib/bootstrap-switch/bootstrap-switch.js',
        'static/src/js/web_widget_boolean_switch.js',
    ],
    "css": [
        'static/lib/bootstrap-switch/bootstrap-switch.css',
    ],
    'qweb': [
        'static/src/xml/web_widget_boolean_switch.xml',
    ],
    "demo": [
        'demo/res_users_view.xml',
    ],
    'description': """""", # TODO: copy README.rst
}
