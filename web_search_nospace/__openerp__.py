# -*- coding: utf-8 -*-
# Copyright 2017 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    'name': "Search no trailing space",
    'author': "Therp BV, Odoo Community Association (OCA)",
    'category': "web",
    'description': """
    This module trims the whitespace from the search bar at the end of your
    search term.
    """,
    'version': "8.0.1.0.0",
    'license': 'AGPL-3',
    'depends': ['web'],
    'data': [
        'views/assets_backend.xml',
    ],
}
