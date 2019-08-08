# -*- coding: utf-8 -*-
#   © 2019 Kevin Kamau
#   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': "Web Hierarachy",
    'version': '10.0.1.0.0',
    'depends': [
        'web'
    ],
    'author': "Kevin Kamau,",
    'website': "https://github.com/KKamaa",
    'category': 'Extra Tools',
    'license': 'AGPL-3',
    'data': [
        'views/web_hierarchy.xml',
    ],
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
    'uninstall_hook': 'uninstall_hook'

}
