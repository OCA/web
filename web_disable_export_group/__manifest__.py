# Copyright 2016 Onestein (<http://www.onestein.eu>)
# Copyright 2018 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Web Disable Export Group',
    'version': '12.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Onestein, '
              'Tecnativa, '
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'category': 'Web',
    'depends': [
        'web',
    ],
    'data': [
        'security/groups.xml',
        'templates/assets.xml',
    ],
    'installable': True,
}
