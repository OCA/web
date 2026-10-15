from odoo import api, fields, models


class ResPartner(models.Model):
    _name = "res.partner"
    _inherit = ["res.partner", "sub.form.parent"]

    _detail_fields = ["kind"]

    kind = fields.Selection(
        [("teacher", "Teacher"), ("student", "Student")], tracking=True
    )

    @api.model
    def _detail_selection(self):
        return [("partner.teacher", "Teacher"), ("partner.student", "Student")]

    def _detail_model(self):
        self.ensure_one()
        return self.kind and f"partner.{self.kind}"
