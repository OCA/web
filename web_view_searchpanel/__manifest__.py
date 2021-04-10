# Copyright 2017-2019 MuK IT GmbH.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

{
    'name': 'Search Panel',
    'summary': 'Kanban Search Panel',
    'version': '12.0.1.0.2',
    'category': 'Extra Tools',
    'license': 'LGPL-3',
    'author': 'MuK IT,  Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'depends': [
        'web',
    ],
    'data': [
        'template/assets.xml',
    ],
    'qweb': [
        'static/src/xml/kanban.xml',
    ],
    'images': [
        'static/description/banner.png'
    ],
    'demo': [
        'demo/res_users_views.xml',
    ]
}
