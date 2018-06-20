# -*- coding: utf-8 -*-

from openerp import models, fields


class IrModel(models.Model):
    _inherit = 'ir.model'

    disable_quick_create = fields.Boolean('Disable quick create')
