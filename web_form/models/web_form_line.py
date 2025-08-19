# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models

from ..tools import evaluate_python_expression


class WebFormLine(models.AbstractModel):
    _name = "web.form.line"
    _description = "Abstract Form Line"

    value = fields.Char()
    form_id = fields.Many2one(
        comodel_name="web.form",
        string="Form",
        required=True,
        ondelete="cascade",
    )
    field_id = fields.Many2one(
        comodel_name="ir.model.fields",
        domain="[('model_id', '=', parent.model_id), "
        "('ttype', 'in', ('text', 'html', 'char', 'date', 'integer', 'float'))]",
    )

    def _need_check_value(self):
        self.ensure_one()
        return self.value

    @api.constrains("value")
    def _check_value(self):
        partner = self.env["res.partner"]
        form = self.env["web.form"]
        for rec in self.filtered(lambda form: form._need_check_value()):
            evaluate_python_expression(rec.value, {"form": form, "partner": partner})

    _sql_constraints = [
        ("field_unique_by_form", "unique (form_id, field_id)", "Field must be unique!")
    ]
