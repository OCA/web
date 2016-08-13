# -*- coding: utf-8 -*-
# © 2016 Cesar Lage (bloopark systems GmbH)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': "Web Widget Radio Tree",
    'summary': "Add radio buttons for records in tree.",
    'author': "bloopark systems GmbH & Co. KG, "
              "Odoo Community Association (OCA)",
    'website': "http://www.bloopark.de",
    'category': 'web',
    'version': '8.0.1.0.0',
    "license": "AGPL-3",
    'depends': [
        'web',
    ],
    'data': [
        'views/assets.xml',
    ],
    'qweb': [
        'static/src/xml/widget.xml',
    ]
}
