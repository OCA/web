# Copyright 2025 Simone Rubino - PyTech
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class FakeModel(models.Model):
    _name = "web_domain_field.fake.model"
    _description = "Fake model for testing web_domain_field"

    partner_id_false_domain = fields.Char(
        compute="_compute_partner_id_false_domain",
        readonly=True,
        store=False,
    )
    partner_id = fields.Many2one(
        comodel_name="res.partner",
    )

    def _compute_partner_id_false_domain(self):
        for record in self:
            record.partner_id_false_domain = False
