# -*- coding: utf-8 -*-
# Copyright 2015 Francesco OpenCode Apruzzese <cescoap@gmail.com>
# Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
# Copyright 2017 Thomas Binsfeld <thomas.binsfeld@acsone.eu>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': "Web Environment Ribbon",
    'version': '10.0.1.0.0',
    'category': 'Web',
    'author': 'Francesco OpenCode Apruzzese, '
              'Tecnativa, '
              'Odoo Community Association (OCA)',
    'website': 'https://it.linkedin.com/in/francescoapruzzese',
    'license': 'AGPL-3',
    "depends": [
        'web',
        ],
    "data": [
        'view/base_view.xml',
        'data/ribbon_data.xml',
        ],
    "update_xml": [],
    "demo_xml": [],
    "auto_install": False,
    'installable': True
}
