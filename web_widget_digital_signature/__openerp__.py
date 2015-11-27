# -*- coding: utf-8 -*-
##############################################################################
#    
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 OpenERP SA (<http://www.openerp.com>)
#    Copyright (C) 2011-2015 Serpent Consulting Services Pvt. Ltd.
#    (<http://www.serpentcs.com>).
#    Copyright 2015 Lorenzo Battistini - Agile Business Group
#
#    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
#
##############################################################################

{
    "name" : "Web Digital Signature",
    "version" : "8.0.1.0.0",
    "author" : "Serpent Consulting Services Pvt. Ltd., "
               "Odoo Community Association (OCA)",
    "category": 'web',
    "license": "AGPL-3",
    'depends': ['web'],
    'data': [
        'views/we_digital_sign_view.xml',
    ],
    'website': 'http://www.serpentcs.com',
    'qweb': ['static/src/xml/digital_sign.xml'],
    'installable': True,
    'auto_install': False,
}
