# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2015 Lorenzo Battistini - Agile Business Group
#
#    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
#
##############################################################################

{
    "name" : "Web Digital Signature for sale orders",
    "version" : "8.0.1.0.0",
    "author" : "Agile Business Group, "
               "Odoo Community Association (OCA)",
    "category": 'web',
    "license": "AGPL-3",
    'depends': ['web_widget_digital_signature', 'sale'],
    'data': [
        'views/sale_order_view.xml'
    ],
    'website': 'http://www.agilebg.com',
    'installable': True,
    'auto_install': False,
}
