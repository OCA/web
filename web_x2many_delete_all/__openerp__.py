# -*- coding: utf-8 -*-
# © 2016 Onestein (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'X2many Delete All Button',
    'summary': """
        Adds a button to x2many fields that removes all linked records
    """,
    'version': '9.0.1.0.0',
    'category': 'Web',
    'author': 'Onestein,Odoo Community Association (OCA)',
    'website': 'http://www.onestein.eu',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'templates/assets.xml'
    ],
    'qweb': [
        'static/src/xml/web_x2many_delete_all.xml'
    ],
    'installable': True,
    'application': False,
}
