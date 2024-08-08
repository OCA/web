# Copyright 2024 ForgeFlow S.L. (https://www.forgeflow.com)
# Part of ForgeFlow. See LICENSE file for full copyright and licensing details.

import json
from ast import literal_eval

from odoo import _, fields, models


class CommandSearch(models.Model):
    _name = "command.search"
    _description = "Command Search"

    name = fields.Char()
    technical_name = fields.Char(copy=False)
    character = fields.Char(size=1, copy=False)
    placeholder = fields.Char(default="Search for a reference...")
    empty_message = fields.Char(default="Reference not found...")
    group_ids = fields.Many2many("res.groups", string="Applied Groups")
    command_search_item_ids = fields.One2many(
        comodel_name="command.search.item",
        inverse_name="command_search_id",
    )
    data = fields.Char(
        readonly=True,
        help="Technical field that allows to see the set of data we are searching on.",
    )
    data_length = fields.Integer(
        readonly=True,
        help="Technical field that allows to see how many items we are searching for.",
    )

    _sql_constraints = [
        (
            "technical_name_uniq",
            "unique (technical_name)",
            _("The Technical Name of the Command Search must be unique!"),
        ),
        (
            "character_uniq",
            "unique (character)",
            _("The Character of the Command Search must be unique!"),
        ),
    ]

    def get_data(self):
        self.ensure_one()
        data = []
        for item in self.command_search_item_ids:
            domain = literal_eval(item.domain)
            records = self.env[item.res_model_id.model].search(domain)
            for record in records:
                for field in item.field_ids:
                    if hasattr(record, field.name) and getattr(record, field.name):
                        data.append(
                            {
                                "res_model": item.res_model_id.model,
                                "res_id": record.id,
                                "value": getattr(record, field.name),
                                "model_name": item.res_model_id.name,
                                "field_name": field.field_description,
                            }
                        )
        return json.dumps(data)

    def set_data(self):
        self.ensure_one()
        self.data = self.get_data()
        self.data_length = len(self.data)
