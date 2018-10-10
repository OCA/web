# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Notify',
    'summary': """
        Send notification messages to user""",
    'version': '12.0.1.0.0',
    'description': 'Web Notify',
    'license': 'AGPL-3',
    'author': 'ACSONE SA/NV,'
              'AdaptiveCity,'
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'depends': [
        'web',
        'bus',
        'base',
    ],
    'data': [
        'views/web_notify.xml'
    ],
    'demo': [
        'views/res_users_demo.xml'
    ],
    'installable': True,
}
