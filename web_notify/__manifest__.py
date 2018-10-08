# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Notify',
    'summary': """
        Send notification messages to user""",
    'version': '11.0.1.1.0',
    'description': 'Web Notify',
    'license': 'AGPL-3',
    'author': 'ACSONE SA/NV,Odoo Community Association (OCA)',
    'website': 'https://acsone.eu/',
    'depends': [
        'web',
        'bus',
    ],
    'data': [
        'views/web_notify.xml'
    ],
    'demo': [
    ],
    'installable': True,
}
