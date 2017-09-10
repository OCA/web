# -*- coding: utf-8 -*-
# Copyright (C) 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright (C) 2011-2015 Serpent Consulting Services Pvt. Ltd.
# (<http://www.serpentcs.com>).
# Copyright 2015 Lorenzo Battistini - Agile Business Group
# Copyright 2016 Alessio Gerace - Agile Business Group
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Widget Digitized Signature",
    "version": "10.0.1.0.0",
    "author": "Serpent Consulting Services Pvt. Ltd., "
               "Agile Business Group, "
               "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": 'Web',
    'depends': ['web'],
    'data': [
        'views/web_digital_sign_view.xml',
    ],
    'website': 'http://www.serpentcs.com',
    'qweb': ['static/src/xml/digital_sign.xml'],
    'installable': True,
    'auto_install': False,
}
