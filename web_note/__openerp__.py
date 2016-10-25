# -*- coding: utf-8 -*-
# © initOS GmbH 2014
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Web Note',
    'version': '7.0.1.0.0',
    'author': 'initOS GmbH',
    'category': '',
    'description':
    """
This module can be used for adding a notes field in any module that need them.
There are three type of notes - private, internal, external.
Only the user that create a private note can see it.
The other two types can be used for creating different views.
    """,
    'website': 'http://www.initos.com',
    'license': 'AGPL-3',
    'images': [],
    'depends': [],
    'data': [
        "web_note_view.xml",
        "security/web_note_security.xml",
        "security/ir.model.access.csv",
    ],
    'active': False,
    'installable': True
}
