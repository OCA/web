# Copyright 2015 0k.io
# Copyright 2016 ACSONE SA/NV
# Copyright 2017 Tecnativa
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": 'web_m2x_options',
    "version": "12.0.2.0.0",
    'category': 'Web',
    "author": "ACSONE SA/NV, "
              "0k.io, "
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/web',
    'license': 'AGPL-3',
    "depends": [
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
