# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class WebFormDefault(models.Model):
    _name = "web.form.default"
    _inherit = "web.form.line"
    _description = "Web Form Default Values"

    value = fields.Char(required=True)
    field_id = fields.Many2one(
        required=True,
        domain="[('model_id', '=', parent.model_id), "
        "('ttype', 'in', "
        "('text', 'html', 'char', 'integer', "
        "'date', 'float', 'many2one', 'selection'))]",
        ondelete="cascade",
    )
