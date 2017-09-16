# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
{
    'name': 'Web Validation Dialog',
    'version': '10.0.1.0.0',
    'category': 'Web',
    'summary': 'Web Validation Dialog',
    'author': 'Serpent Consulting Services Pvt. Ltd., '
              'Odoo Community Association (OCA)',
    'license': 'LGPL-3',
    'website': 'http://www.serpentcs.com',
    'depends': [
        'web',
    ],
    'data': [
        'views/res_company.xml',
        'views/res_users.xml',
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/web_validation_dialog.xml',
    ],
    'installable': True,
    'application': True
}
