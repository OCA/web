# © 2018 Savoir-faire Linux
# License LGPL-3.0 or later (http://www.gnu.org/licenses/LGPL).

{
    'name': 'Calendar Custom Settings',
    'version': '11.0.1.0.0',
    'author': 'Savoir-faire Linux',
    'maintainer': 'Savoir-faire Linux',
    'website': 'https://www.savoirfairelinux.com',
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
