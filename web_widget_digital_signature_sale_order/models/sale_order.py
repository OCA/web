# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2015 Lorenzo Battistini - Agile Business Group
#
#    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
#
##############################################################################

from openerp import models, fields, api

class Users(models.Model):
    _inherit = 'sale.order'

    signature_image= fields.Binary(string='Signature')
