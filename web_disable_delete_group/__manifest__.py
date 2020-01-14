# Copyright 2016 Onestein (<http://www.onestein.eu>)
# Copyright 2018 Tecnativa - David Vidal
# Copyright 2020 Abdou Nasser
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Web Disable Delete Group',
    'version': '11.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Onestein, '
              'Tecnativa, '
              'Odoo Community Association (OCA)',
              'Abdou Nasser'
    'website': 'http://www.github.com/OCA/web',
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
