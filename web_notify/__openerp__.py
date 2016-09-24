# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Notify',
    'summary': """
        Send notification messages to user""",
    'version': '9.0.1.0.0',
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
}
