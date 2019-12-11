# See LICENSE file for full copyright and licensing details.

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class ModelExternalHelp(models.Model):
    _name = "model.external.help"
    _description = "Model External Help"
    _rec_name = "model_id"

    model_id = fields.Many2one(
        string="Model", comodel_name="ir.model", ondelete="cascade", required=True
    )
    external_url = fields.Char(string="External URL")
    link_text = fields.Char(string="Link Text")
    help_text = fields.Text(string="Help Text")
    model = fields.Char(related="model_id.model", string="Model Name")

    @api.constrains("model_id")
    def _check_duplicate_model(self):
        model_help_obj = self.env["model.external.help"]
        for rec in self:
            if model_help_obj.search(
                [("model_id", "=", rec.model_id.id), ("id", "!=", rec.id)]
            ):
                raise ValidationError(
                    _(
                        "Help already been added \
                    for the model: {}"
                    ).format(rec.model_id.name)
                )
