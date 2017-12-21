# coding: utf-8
# Copyright 2014 Sébastien BEAU <sebastien.beau@akretion.com>
# Copyright 2017 Sylvain CALADOR <sylvain.calador@akretion.com>
# Copyright 2017 Raphael Reverdy <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Proxy Action',
    'version': '10.0.0.0.1',
    'author': 'Akretion',
    'website': 'www.akretion.com',
    'license': 'AGPL-3',
    'category': 'Generic Modules',
    'description': """
    Forward to pywebdriver odoo's actions.
    """,
    'depends': [
        'base',
    ],
    'data': [
        'static/src/xml/view.xml',
    ],
    'installable': True,
}
