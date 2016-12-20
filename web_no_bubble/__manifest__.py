# -*- coding: utf-8 -*-
# © 2016 Savoir-faire Linux
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

{
    'name': 'Web No Bubble',
    'version': '10.0.1.0.0',
    'author': 'Savoir-faire Linux',
    'maintainer': (
        'Savoir-faire Linux,'
        'Odoo Community Association (OCA)'
    ),
    'website': 'https://www.savoirfairelinux.com',
    'license': 'AGPL-3',
    'category': 'Web',
    'summary': 'Remove the bubbles from the web interface',
    'depends': ['web'],
    'data': [
        'views/web_no_bubble.xml',
    ],
    'installable': True,
    'application': False,
}
