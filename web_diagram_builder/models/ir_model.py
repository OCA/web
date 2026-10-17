# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class IrModel(models.Model):
    _inherit = "ir.model"

    has_hierarchy = fields.Boolean(
        string="Supports Hierarchy",
        compute="_compute_has_hierarchy",
        store=True,
        help="True if the model has at least one many2one field pointing "
             "to itself, making it usable in the diagram builder.",
    )

    def _compute_has_hierarchy(self):
        for rec in self:
            if rec.model not in self.env:
                rec.has_hierarchy = False
                continue
            Model = self.env[rec.model]
            rec.has_hierarchy = any(
                f.type == "many2one" and f.comodel_name == rec.model
                for f in Model._fields.values()
            )
