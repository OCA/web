# -*- coding: utf-8 -*-
# Copyright 2017 Ignacio Ibeas <ignacio@acysos.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models, fields, api, _


class HiddenTemplateField(models.Model):
    _name = 'hidden.template.field'
    _description = 'Hidden template field'

    name = fields.Many2one(
        comodel_name='ir.model.fields', string='Field', required=True)
    users = fields.Many2many(
        comodel_name='res.users', string='Users', relation='hidden_field_user',
        column1='hidden_field', column2='hidden_user',
        help="If you don't select any user, the field is hidden to all users")
    groups = fields.Many2many(
        comodel_name='res.groups', string='Groups',
        relation='hidden_field_group', column1='hidden_field',
        column2='hidden_group', help="Is you don't select any group, the field"
        "is hidden to all groups")
    active = fields.Boolean(related='template_id.active')
    model = fields.Many2one(
        comodel_name='ir.model', related='template_id.name')
    company_id = fields.Many2one(
        comodel_name='res.company', related='template_id.company_id')
    template_id = fields.Many2one(comodel_name='hidden.template')


class HiddenTemplate(models.Model):
    _name = 'hidden.template'
    _description = 'Hidden template'

    def _default_company(self):
        return self.env['res.company']._company_default_get('hidden.template')

    name = fields.Many2one(
        comodel_name='ir.model', string='Model', required=True)
    active = fields.Boolean(string="Active", default=True)
    hidden_fields = fields.One2many(
        comodel_name='hidden.template.field', inverse_name='template_id')
    company_id = fields.Many2one(
        comodel_name='res.company', string='Company', index=True, required=True,
        default=_default_company)
