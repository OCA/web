# -*- coding: utf-8 -*-
# Copyright 2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp import api, fields, models
from openerp.exceptions import MissingError


class DarkroomModal(models.TransientModel):
    _name = 'darkroom.modal'
    _description = 'Darkroom Modal - Wizard Model'

    @api.model
    def _default_res_model_id(self):
        res_model_name = self.env.context.get('active_model')
        return self.env['ir.model'].search([('model', '=', res_model_name)])

    @api.model
    def _default_res_record_id(self):
        return self.env.context.get('active_record_id', 0)

    @api.model
    def _default_res_record(self):
        res_model_name = self._default_res_model_id().model
        try:
            res_model_model = self.env[res_model_name]
        except KeyError:
            return None

        return res_model_model.browse(self._default_res_record_id())

    @api.model
    def _default_res_field_id(self):
        res_model_id = self._default_res_model_id()
        res_field_name = self.env.context.get('active_field')
        return self.env['ir.model.fields'].search([
            ('model_id', '=', res_model_id.id),
            ('name', '=', res_field_name),
        ])

    @api.model
    def _default_image(self):
        res_record = self._default_res_record()
        res_field_name = self._default_res_field_id().name

        try:
            return getattr(res_record, res_field_name, None)
        except (TypeError, MissingError):
            return None

    res_model_id = fields.Many2one(
        comodel_name='ir.model',
        string='Source Model',
        required=True,
        default=lambda s: s._default_res_model_id(),
    )
    res_record_id = fields.Integer(
        string='Source Record ID',
        required=True,
        default=lambda s: s._default_res_record_id(),
    )
    res_field_id = fields.Many2one(
        comodel_name='ir.model.fields',
        string='Source Field',
        required=True,
        default=lambda s: s._default_res_field_id(),
    )
    image = fields.Binary(
        string='Darkroom Image',
        required=True,
        default=lambda s: s._default_image(),
    )

    @api.multi
    def action_save(self):
        self.ensure_one()

        res_record = self._default_res_record()
        res_field_name = self._default_res_field_id().name
        setattr(res_record, res_field_name, self.image)

        return {'type': 'ir.actions.act_window_close'}
