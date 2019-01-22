# -*- coding: utf-8 -*-
# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Widget Iframe',
    'summary': """
        Allow to display an iframe from an URL. The user should be
        aware of cross domain problems""",
    'version': '10.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'ACSONE SA/NV,Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web/',
    'depends': [
        'web',
    ],
    'data': [
        'views/assets.xml',
    ],
    'qweb': [
        'static/src/xml/web_widget_iframe.xml',
    ],
    'demo': [
    ],
}
