# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from openerp import models, fields, api

class Users(models.Model):
    _name = 'res.users'
    _inherit = 'res.users'

    signature= fields.Binary(string='Signature')

