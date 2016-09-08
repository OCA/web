# coding: utf-8
# © 2015 David BEAL @ Akretion <david.beal@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Help Popup',
    'version': '8.0.2.0.0',
    'author': 'Akretion, Odoo Community Association (OCA)',
    'depends': [
        'web',
    ],
    'website': 'https://www.akretion.com',
    'data': [
        'views/popup_help_view.xml',
        'views/action_view.xml',
        'report/report.xml',
        'report/help.xml',
        'report/all.xml',
    ],
    'demo': [
        'demo/help.xml',
    ],
    'qweb': [
        'static/src/xml/popup_help.xml',
    ],
    'installable': True,
}
