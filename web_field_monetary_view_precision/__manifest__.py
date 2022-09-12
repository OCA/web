# Copyright 2022 Yiğit Budak (https://github.com/yibudak)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': "Monetary Field View Precision",

    'summary': """
        This module allows to set the view precision on monetary fields.
    """,

    "author": "Yiğit Budak, "
              "Odoo Community Association (OCA)",
    'website': "https://github.com/oca/web/",

    "license": "AGPL-3",
    "category": "Web",
    'version': '12.0.1.0.0',

    'depends': ['base', 'account'],

    'data': [
        'views/res_currency_view.xml',
    ]
}
