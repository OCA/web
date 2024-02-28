# Copyright 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models, tools


class WebCustomModifier(models.Model):

    _name = "web.custom.modifier"
    _description = "Custom View Modifier"

    model_ids = fields.Many2many(
        "ir.model", "ir_model_custom_modifier", "modifier_id", "model_id", "Model"
    )
    type_ = fields.Selection(
        [
            ("field", "Field"),
            ("xpath", "Xpath"),
        ],
        string="Type",
        default="field",
        required=True,
    )
    modifier = fields.Selection(
        [
            ("invisible", "Invisible"),
            ("column_invisible", "Invisible (List Views)"),
            ("readonly", "Readonly"),
            ("force_save", "Force Save"),
            ("required", "Required"),
            ("selection_hide", "Hide Selection Item"),
            ("widget", "Widget"),
            ("limit", "Number of lines per page (List Views)"),
            ("optional", "Optional"),
        ],
        required=True,
    )
    reference = fields.Char(required=True)
    key = fields.Char()
    active = fields.Boolean(default=True)
    excluded_group_ids = fields.Many2many(
        "res.groups",
        "web_custom_modifier_excluded_group_rel",
        "modifier_id",
        "group_id",
        "Excluded Groups",
    )

    @api.model
    def create(self, vals):
        new_record = super().create(vals)
        self._clear_modifier_cache()
        return new_record

    def write(self, vals):
        super().write(vals)
        self._clear_modifier_cache()
        return True

    def unlink(self):
        super().unlink()
        self._clear_modifier_cache()
        return True

    def _clear_modifier_cache(self):
        for model in (
            self.sudo().env["web.custom.modifier"].search([]).mapped("model_ids.model")
        ):
            self.env[model].clear_caches()

    @tools.ormcache()
    def _get_cache(self):
        return [
            el._to_dict() for el in self.sudo().env["web.custom.modifier"].search([])
        ]

    def _to_dict(self):
        return {
            "models": self.mapped("model_ids.model"),
            "key": self.key,
            "type_": self.type_,
            "modifier": self.modifier,
            "reference": self.reference,
            "excluded_group_ids": self.excluded_group_ids.ids,
        }

    def get(self, model):
        cache = self._get_cache()
        user_group_ids = self.env.user.groups_id.ids
        return [
            el
            for el in cache
            if model in el["models"]
            and all(id_ not in user_group_ids for id_ in el["excluded_group_ids"])
        ]
