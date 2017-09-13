# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
{
    'name': 'Web Security Dialog',
    'version': '10.0.1.0.0',
    'category': 'Web',
    'summary': 'Web Security Dialog',
    'author': 'Serpent Consulting Services Pvt. Ltd.',
    'maintainer': 'Serpent Consulting Services Pvt. Ltd.',
    'license': 'AGPL-3',
    'website': 'http://www.serpentcs.com',
    'depends': [
        'web',
    ],
    'data': [
        'views/res_company_security.xml',
        'views/templates.xml'
    ],
    'qweb': [
        'static/src/xml/web_security_dialog.xml',
    ],
#    'images': ['static/description/web_banner.png'],
    'installable': True,
    'application': True
}
