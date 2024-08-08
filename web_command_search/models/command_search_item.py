# Copyright 2024 ForgeFlow S.L. (https://www.forgeflow.com)
# Part of ForgeFlow. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class CommandSearchItem(models.Model):
    _name = "command.search.item"
    _description = "Command Search Item"

    command_search_id = fields.Many2one(
        comodel_name="command.search",
        required=True,
    )
    res_model_id = fields.Many2one(
        comodel_name="ir.model",
        string="Model",
        required=True,
        ondelete="cascade",
    )
    domain = fields.Char(string="Model Domain", default="[]")
    field_ids = fields.Many2many(
        comodel_name="ir.model.fields",
        string="Fields",
        column1="command_search_item_id",
        column2="field_id",
        domain="[('model_id', '=', res_model_id), ('ttype', 'in', ['char', 'text'])]",
    )
