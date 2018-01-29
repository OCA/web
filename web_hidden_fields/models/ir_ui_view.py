# -*- coding: utf-8 -*-
# Copyright 2017 Ignacio Ibeas <ignacio@acysos.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, models
from odoo.osv import orm
import json


class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    @api.multi
    def _check_hidden_field(self, model_name, field_name):
        model = self.env['ir.model'].search([('model', '=', model_name)])
        field = self.env['ir.model.fields'].search(
            [('name', '=', field_name), ('model_id', '=', model.id)])
        hidden_field = self.env['hidden.template.field'].search(
            [('name', '=', field.id), ('model', '=', model.id),
             ('company_id', '=', self.env.user.company_id.id),
             ('active', '=', True)])
        if hidden_field:
            if not hidden_field.users and not hidden_field.groups:
                return True
            if self.env.user in hidden_field.users:
                return True
            for group in hidden_field.groups:
                if group in self.env.user.groups_id:
                    return True
        return False

    @api.model
    def postprocess(self, model, node, view_id, in_tree_view, model_fields):
        fields = super(IrUiView, self).postprocess(
            model, node, view_id, in_tree_view, model_fields)
        if node.tag == 'field':
            remove = self._check_hidden_field(model, node.get('name'))
            if remove:
                modifiers = json.loads(node.get('modifiers'))
                if 'required' in modifiers and modifiers['required']:
                    modifiers['invisible'] = True
                    orm.transfer_modifiers_to_node(modifiers, node)
                else:
                    node.getparent().remove(node)
                    fields.pop(node.get('name'), None)
        return fields
