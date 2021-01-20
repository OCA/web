# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web PWA Cache',
    'summary': 'Adds support to offline usage and mobile views improvements',
    'version': '12.0.1.0.0',
    'category': 'Website',
    'author': "Tecnativa, "
              "Odoo Community Association (OCA)",
    'website': 'https://www.tecnativa.com',
    'license': 'AGPL-3',
    'depends': [
        'web_pwa_oca',
    ],
    'data': [
        'security/ir.model.access.csv',
        'templates/assets.xml',
        'views/pwa_cache_views.xml',
        'views/res_partner_views.xml',
        'data/data.xml',
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    'installable': True,
    'auto_install': False,
}
