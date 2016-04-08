# -*- coding: utf-8 -*-
# © 2015 initOS GmbH (<http://www.initos.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Web Widget - Internal mail wizard for email links',
    'summary': 'Send mail using internal composition wizard.',
    'version': '8.0.1.0.0',
    'category': 'Social Network',
    'website': 'https://odoo-community.org',
    'author': 'initOS GmbH, Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'application': False,
    'installable': True,
    'auto_install': False,
    'depends': [
        'mail',
    ],
    'data': [
        'assets.xml',
    ],
    'qweb': [
        'static/src/xml/web_widget_mail_send_odoo.xml',
    ],
}
