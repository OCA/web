# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2015 Lorenzo Battistini - Agile Business Group
#
#    About License, see __openerp__.py
#
##############################################################################

from openerp import models, fields, api

class Users(models.Model):
    _inherit = 'sale.order'

    signature_image= fields.Binary(string='Signature')
