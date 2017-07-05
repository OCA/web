# -*- coding: utf-8 -*-
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import fields, models


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    signature_image = fields.Binary(
        string='Signature',
        related='user_id.signature_image',
    )
