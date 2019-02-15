# Odoo, Open Source Web View Transition
# Copyright (C) 2019 Alexandre Díaz <dev@redneboa.es>
#
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).#
{
    'name': "Web View Transition",
    'category': "web",
    'version': "11.0.1.0.0",
    'author': "Alexandre Díaz, "
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/Web',
    'depends': ['base', 'web'],
    'summary': 'This module adds transitions to display views',
    'data': [
        'view/web_view_transition.xml',
        'view/inherited_view_users_form_simple_modif.xml',
    ],
    'license': 'AGPL-3',
    'auto_install': False,
    'installable': True,
}
