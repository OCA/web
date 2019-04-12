# Copyright 2019 mharenz https://github.com/mharenz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Web edit mode',
    'version': '11.0.2.0.0',
    'category': 'Web',
    'author': 'Michael Harenz <m.harenz@kjellberg.de>, '
            'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    "data": [
        'views/res_users_view.xml',
        'views/web_edit_mode_view.xml',
    ],
    'qweb': [
        "static/src/xml/web_edit_mode_view.xml",
    ],

    'installable': True,
    'auto_install': False,
}
