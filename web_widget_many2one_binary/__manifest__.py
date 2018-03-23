# -*- encoding: utf-8 -*-
# © 2017 TKO <http://tko.tko-uk.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Widget Many2one Binary',
    'version': '10.0.0.0.0',
    "author": 'TKO',
    'category': 'web',
    'license': 'AGPL-3',

    'website': 'http://tko.tko-br.com',
    'description': """
    * Binary widget for many2one Field
    """,
    'depends': ['web'],
    'qweb': [
        'static/src/xml/widget_template.xml',
    ],
    'data': [
        'views/widget_view.xml',
    ],
    'installable': True,
    'auto_install': True,
}
