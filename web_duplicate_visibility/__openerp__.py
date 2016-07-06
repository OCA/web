# -*- coding: utf-8 -*-
# Copyright 2016 Acsone SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Duplicate Visibility',
    'summary': """
        This module allows to manage the visibility of duplicate button from
        the form view declaration.""",
    'version': '7.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Acsone SA,Odoo Community Association (OCA)',
    'website': 'https://acsone.eu',
    'application': False,
    'installable': True,
    "description": """
Web Duplicate Visibility
========================
Features:
---------

Allows to add a 'duplicate' attribute to a form and to set it at '0'
to remove the duplicate function

    """,
    'depends': ['web'],
    'js': ['static/src/js/web_duplicate_visibility.js'],
    'data': [
    ],
    'demo': [
    ],
}
