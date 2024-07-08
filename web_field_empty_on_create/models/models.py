# Copyright 2024 ooops404
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import inspect

from odoo import api, fields, models


class M2XCreateEditOption(models.Model):
    _inherit = "m2x.create.edit.option"

    field_empty_rule_id = fields.Many2one("field.empty.rule", ondelete="cascade")


class FieldEmptyRule(models.Model):
    _name = "field.empty.rule"
    _description = "Field Empty Rule"

    group_ids = fields.Many2many("res.groups")
    model_id = fields.Many2one("ir.model", required=True, ondelete="cascade")
    model_name = fields.Char(
        compute="_compute_model_name", string="Model Tech. Name", store=True
    )
    field_id = fields.Many2one(
        "ir.model.fields",
        domain="[('model_id', '=', model_id)]",
        required=True,
        ondelete="cascade",
    )
    field_name = fields.Char(
        compute="_compute_field_name", string="Field Tech. Name", store=True
    )
    edit_option_ids = fields.One2many(
        "m2x.create.edit.option", "field_empty_rule_id", string="Edit Options"
    )

    @api.depends("model_id")
    def _compute_model_name(self):
        for rec in self:
            rec.model_name = rec.model_id.model

    @api.depends("field_id")
    def _compute_field_name(self):
        for rec in self:
            rec.field_name = rec.field_id.name

    @api.model_create_multi
    def create(self, vals_list):
        recs = super().create(vals_list)
        for rec in recs:
            rec.update_field_options()
        return recs

    def write(self, vals):
        for rec in self:
            if vals.get("field_id"):
                rec.update_field_options()
        return super().write(vals)

    def update_field_options(self):
        self.edit_option_ids.unlink()
        fields_to_do = self.env["ir.model.fields"].search(
            [
                ("ttype", "in", ["many2one", "many2many"]),
                ("relation", "=", self.model_name),
            ]
        )
        vals_to_create = []
        for ft in fields_to_do:
            # Prevent quick create for each related field referencing this model
            vals_to_create.append(
                {
                    "field_empty_rule_id": self.id,
                    "field_id": ft.id,
                    "model_id": ft.model_id.id,
                    "option_create": "set_false",
                    "option_create_edit": "force_true",
                }
            )
        if fields_to_do:
            self.env["m2x.create.edit.option"].create(vals_to_create)


class BaseModel(models.AbstractModel):
    _inherit = "base"

    @api.model
    def default_get(self, fields_list):
        vals = super().default_get(fields_list)
        # Logic applied only if user creates record from a form.
        # default_get should work as usual for other cases, like cron or whatever else.
        # If params and view_type is there - definitely called from a form,
        # but if called from quick create, then there is no params.
        # Easiest solution i came up with is to check stack as you can see below.
        stack = [r.function for r in inspect.stack()]
        # TODO improve stack hack.
        if (
            "params" in self.env.context and "view_type" in self.env.context["params"]
        ) or ("onchange" in stack and "create" not in stack):
            rules = self.env["field.empty.rule"].search(
                [
                    ("model_name", "=", self._name),
                    ("field_name", "in", fields_list),
                ]
            )
            for rule in rules:
                if (
                    not rule.group_ids or self.env.user.groups_id & rule.group_ids
                ) and rule.field_id.name in fields_list:
                    fields_list.remove(rule.field_id.name)
                vals.pop(rule.field_id.name, None)
        return vals


class IrModelFields(models.Model):
    _inherit = "ir.model.fields"

    @api.model
    def create(self, vals):
        res = super().create(vals)
        rules = self.env["field.empty.rule"].search([("model_name", "=", res.relation)])
        if rules:
            rules.update_field_options()
        return res
