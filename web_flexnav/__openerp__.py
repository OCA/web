# -*- coding: utf-8 -*-
# © 2016 Mercedes Scenna (bloopark systems GmbH)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Flexnav for Backend Smart buttons',
    'summary': 'Smart buttons navigation for Backend Views',
    'author': "bloopark systems GmbH & Co. KG",
              "Odoo Community Association (OCA)",
    'website': "http://www.bloopark.de",
    'category': 'web',
    'version': '9.0.1.1.0',
    "license": "AGPL-3",
    'depends': [
        'base',
        'sale',
        'web',
    ],
    'data': [
        'views/assets.xml',
        'views/res_partner.xml',
    ]
}
