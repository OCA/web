# Copyright 2009-2019 Noviat.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Image Paint widget',
    'version': '12.0.1.0.0',
    'author': 'Noviat, '
              'Odoo Community Association (OCA)',
    "development_status": "Production/Stable",
    "maintainers": ["Noviat"],
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    'category': 'web',
    'depends': [
        'web',
    ],
    'summary': 'Image painting widget',
    'qweb': [
        'static/src/xml/web_paint.xml'],
    'data': [
        'views/assets_backend.xml',
    ],
    'installable': True,
}
