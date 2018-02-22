# -*- coding: utf-8 -*-
# Copyright 2016-2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import models, fields


class SlickExample(models.Model):
    _name = 'slick.example'
    _description = 'Slick Example Model'

    slick_image_ids = fields.One2many(
        name='Slick Images',
        comodel_name='ir.attachment',
        inverse_name='res_id',
    )
    slickroom_image_ids = fields.One2many(
        name='Slickroom Images',
        comodel_name='ir.attachment',
        inverse_name='res_id',
    )
