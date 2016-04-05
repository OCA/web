# -*- coding: utf-8 -*-
# © 2016-TODAY LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class SlickExample(models.Model):
    _name = 'slick.example'
    _description = 'Slick Example Model'
    image_ids = fields.One2many(
        name='Images',
        comodel_name='ir.attachment',
        inverse_name='res_id',
    )
