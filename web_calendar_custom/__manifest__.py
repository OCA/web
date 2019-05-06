# Copyright 2019 Savoir-faire Linux
# License AGPL-3.0 or later (http://www.gnu.org/licenses/LGPL).

{
    'name': 'Calendar Custom Settings',
    'version': '11.0.1.0.0',
    'author': 'Savoir-faire Linux',
                 'Odoo Community Association (OCA)',
    'maintainer': 'Savoir-faire Linux',
    'website': 'https://github.com/OCA/web',
    'license': 'LGPL-3',
    'category': 'Web',
    'summary': 'Change default calendar settings',
    'depends': [
        'web',
        'calendar',
    ],
    'data': [
        'data/ir_config_parameter.xml',
        'views/res_config_views.xml',
        'views/assets.xml',
    ],
    'installable': True,
    'application': True,
}
