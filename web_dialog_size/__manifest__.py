# -*- coding: utf-8 -*-
# Copyright 2015 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': "Web Dialog Size",
    'summary': """
        A module that lets the user expand a
        dialog box to the full screen width.""",
    'author': "ACSONE SA/NV, "
              "Therp BV, "
              "Siddharth Bhalgami,"
              "Tecnativa, "
              "Odoo Community Association (OCA)",
    'website': "http://acsone.eu",
    'category': 'web',
    'version': '10.0.1.0.1',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'qweb': [
        'static/src/xml/web_dialog_size.xml',
    ],
    'data': [
        'templates/assets.xml',
    ],
    'installable': True,
}
