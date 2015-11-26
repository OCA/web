# -*- coding: utf-8 -*-
##############################################################################
#    
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 OpenERP SA (<http://www.openerp.com>)
#    Copyright (C) 2011-2015 Serpent Consulting Services Pvt. Ltd.
#    (<http://www.serpentcs.com>).
#
#    About License, see __openerp__.py
#
##############################################################################

from openerp import models, fields, api

class Users(models.Model):
    _name = 'res.users'
    _inherit = 'res.users'

    signature_image= fields.Binary(string='Signature')
