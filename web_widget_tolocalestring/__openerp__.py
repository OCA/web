# -*- coding: utf-8 -*-
# (c) 2016 Tony Galmiche / InfoSaône
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
{
    "name": "Widget use Number.prototype.toLocaleString()",
    'version': '1.0',
    'author': 'Tony Galmiche',
    'category': 'web',
    'description': """
Widget use Number.prototype.toLocaleString()
    """,
    'maintainer': 'InfoSaône',
    'website': 'http://www.infosaone.com',
    'depends': [
        'base', 'web',
    ],
    'data': [
        'view/assets.xml',
    ],
    'qweb': [
        'static/src/xml/widget.xml',
    ],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False
}
