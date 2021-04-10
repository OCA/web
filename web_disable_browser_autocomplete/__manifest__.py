# Copyright (C) 2020  Renato Lima - Akretion
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    'name': 'Web Disable Autocomplete',
    'summary': 'Allow disable browser autocomplete.',
    'category': "Website",
    'license': 'AGPL-3',
    'author': 'Akretion, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/web',
    'version': '12.0.1.0.1',
    'depends': ['web'],
    'qweb': [
        'static/src/web/base.xml',
    ],
    'installable': True,
}
