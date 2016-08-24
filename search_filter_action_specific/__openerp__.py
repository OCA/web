# -*- coding: utf-8 -*-
# © initOS GmbH 2013
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name":     "Action-specific custom search filter",
    "version":  "7.0.1.0.0",
    "depends":  ["web",
                 ],
    'author':   'initOS GmbH, Odoo Community Association (OCA)',
    "summary":  "Allows to make search filters specific for an action",
    'license':  'AGPL-3',
    "description": """
    Allows to make search filters specific for an action.
    """,
    'js': ['static/src/js/search.js',
           ],
    'css': ['static/src/css/search.css',
            ],
    'qweb': ['static/src/xml/base.xml',
             ],
    'installable': True,
    'auto_install': False,
}
