# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)


from odoo import _, api, exceptions, fields, models
from odoo.tools.safe_eval import safe_eval


class ModelButtonRule(models.Model):
    _name = "model.button.rule"
    _description = "Rule to hide a button"

    button_name = fields.Char(required=True)
    action = fields.Selection([("hide", "Hide")], default="hide", required=True)
    model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        index=True,
    )
    model_name = fields.Char(related="model_id.model")
    condition_domain = fields.Char()
    group_ids = fields.Many2many("res.groups", required=True)
    # generated technical fields used in form attrs:
    button_visibility_field_id = fields.Many2one("ir.model.fields", ondelete="cascade")

    @api.model
    def create(self, vals):
        rec = super().create(vals)
        if not hasattr(self.env[rec.model_name], rec.button_name):
            raise exceptions.ValidationError(
                _("Model %s has no method %s." % (rec.model_name, rec.button_name))
            )
        rec.create_restriction_field()
        return rec

    def create_restriction_field(self):
        """Create computed visibility field to hide button"""
        field_name = self.get_button_field_name()
        field_id = self.env["ir.model.fields"].search(
            [("name", "=", field_name), ("state", "=", "manual")]
        )
        rec_model_id = self.model_id.id
        rec_field_name = "button_visibility_field_id"
        if not field_id:
            deps = ""
            if self.condition_domain:
                deps = ",".join(
                    [
                        r[0] if r[0] not in ["id"] else ""
                        for r in safe_eval(self.condition_domain)
                    ]
                )
            field_id = self.env["ir.model.fields"].create(
                {
                    "name": field_name,
                    "model_id": rec_model_id,
                    "state": "manual",
                    "field_description": "%s %s hide button field"
                    % (self.model_name, self.button_name),
                    "store": False,
                    "ttype": "boolean",
                    "compute": "for r in self: r._compute_hide_button()",
                    "depends": deps,
                }
            )
        self[rec_field_name] = field_id

    def get_button_field_name(self):
        # e.g. x_computed_button_hide_sale_order_action_draft
        return "x_computed_button_hide_%s_%s" % (
            self.model_name.replace(".", "_"),
            self.button_name,
        )
