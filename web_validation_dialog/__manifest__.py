# -*- coding: utf-8 -*-
# © 2017 Serpent Consulting Services Pvt. Ltd. (http://www.serpentcs.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
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
