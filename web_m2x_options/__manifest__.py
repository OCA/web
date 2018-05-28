
{
    "name": 'web_m2x_options',
    "version": "11.0.1.0.0",
    'category': 'Web',
    "author": "ACSONE SA/NV, "
              "0k.io, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    "depends": [
        'base',
        'web',
    ],
    'data': [
        'views/view.xml'
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    'installable': True,
}
