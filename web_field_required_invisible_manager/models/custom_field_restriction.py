# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval


class CustomFieldRestriction(models.Model):
    _name = "custom.field.restriction"
    _description = "Make field invisible or required"

    field_id = fields.Many2one(
        "ir.model.fields",
        ondelete="cascade",
        required=True,
        string="Field",
    )
    field_name = fields.Char(
        related="field_id.name",
        store=True,
        string="Field Name",
    )
    required_model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        string="required_model_id",
        index=True,
    )
    invisible_model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        string="invisible_model_id",
        index=True,
    )
    readonly_model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        string="readonly_model_id",
        index=True,
    )
    model_name = fields.Char(
        compute="_compute_model_name",
        store=True,
        string="Model Name",
        index=True,
    )
    condition_domain = fields.Char()
    group_ids = fields.Many2many("res.groups", required=True)
    default_required = fields.Boolean(related="field_id.required")
    required = fields.Boolean()
    field_invisible = fields.Boolean()
    field_readonly = fields.Boolean()
    # generated technical fields used in form attrs:
    visibility_field_id = fields.Many2one("ir.model.fields")
    readonly_field_id = fields.Many2one("ir.model.fields")
    required_field_id = fields.Many2one("ir.model.fields")

    @api.onchange("field_id")
    def onchange_field_id(self):
        self.update(
            {
                "required": self.field_id.required,
                "field_invisible": False,
                "field_readonly": self.field_id.readonly,
            }
        )

    @api.depends("required_model_id", "invisible_model_id", "readonly_model_id")
    def _compute_model_name(self):
        for rec in self:
            if rec.required_model_id:
                rec.model_name = rec.required_model_id.model
            elif rec.invisible_model_id:
                rec.model_name = rec.invisible_model_id.model
            elif rec.readonly_model_id:
                rec.model_name = rec.readonly_model_id.model

    @api.model
    def create(self, vals):
        rec = super().create(vals)
        if rec.invisible_model_id and rec.field_invisible:
            rec.create_restriction_field("visibility")
        elif rec.readonly_model_id and rec.field_readonly:
            rec.create_restriction_field("readonly")
        elif rec.required_model_id and rec.required:
            rec.create_restriction_field("required")
        return rec

    def write(self, vals):
        res = super().write(vals)
        if vals.get("field_id"):
            if self.visibility_field_id:
                self.visibility_field_id.unlink()
                self.create_restriction_field("visibility")
            elif self.readonly_field_id:
                self.readonly_field_id.unlink()
                self.create_restriction_field("readonly")
            elif self.required_field_id:
                self.required_field_id.unlink()
                self.create_restriction_field("required")
        return res

    def create_restriction_field(self, f_type):
        field_name = self.get_field_name(f_type)
        field_id = self.env["ir.model.fields"].search(
            [("name", "=", field_name), ("state", "=", "manual")]
        )
        if f_type == "required":
            rec_model_id = self.required_model_id.id
            rec_field_name = "required_field_id"
        elif f_type == "readonly":
            rec_model_id = self.readonly_model_id.id
            rec_field_name = "readonly_field_id"
        elif f_type == "visibility":
            rec_model_id = self.invisible_model_id.id
            rec_field_name = "visibility_field_id"
        if not field_id:
            deps = ""
            if self.condition_domain:
                deps = ",".join(
                    {r[0] for r in safe_eval(self.condition_domain)} - {"id", "&", "|"}
                )
            field_id = self.env["ir.model.fields"].create(
                {
                    "name": field_name,
                    "model_id": rec_model_id,
                    "state": "manual",
                    "field_description": "%s %s field" % (self.field_id.name, f_type),
                    "store": False,
                    "ttype": "boolean",
                    "compute": "for r in self: r._compute_restrictions_fields()",
                    "depends": deps,
                }
            )
        self[rec_field_name] = field_id

    def get_field_name(self, f_type):
        # e.g. x_computed_res_partner_name_readonly
        res = "x_computed_%s_%s_%s" % (
            self.field_id.model.replace(".", "_"),
            self.field_id.name,
            f_type,
        )
        return res

    def unlink(self):
        for rec in self:
            rec.visibility_field_id.unlink()
            rec.readonly_field_id.unlink()
            rec.required_field_id.unlink()
        return super(CustomFieldRestriction, self).unlink()
