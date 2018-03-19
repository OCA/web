# -*- coding: utf-8 -*-
# © <YEAR(S)> <AUTHOR(S)>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web widget boolean switch",
    "summary": "This module add widget to render boolean fields",
    "version": "10.0.1.0.0",
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
        'static/src/xml/assets.xml'
    ],
    'test': [
        'static/test/web_widget_boolean_switch.js',
    ],
    'qweb': [
        'static/src/xml/web_widget_boolean_switch.xml',
    ],
    "demo": [
        'demo/res_users_view.xml',
    ],
    'description': """
    This module add a widget ``boolean_switch`` to render boolean fields. One
of it's main features is to quick edit that field without enter in edit mode
from list view or form view.
""",
}
