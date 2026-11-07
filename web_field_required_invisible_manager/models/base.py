# Copyright 2023 ooops404
# Copyright 2025 Simone Rubino - PyTech
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
from odoo import models
from odoo.tools.safe_eval import safe_eval


class Base(models.AbstractModel):
    _inherit = "base"

    def default_get(self, fields_list):
        res = super(Base, self).default_get(fields_list)
        if self.env.user.has_group("base.group_user"):
            vals = self._default_get_compute_restrictions_fields()
            if vals:
                res.update(vals)
        return res

    def _check_restriction_group(self, rule):
        """
        Determina si la restricción debe aplicarse al usuario actual basándose
        en los grupos y el método (Whitelist/Blacklist).
        Devuelve True si la restricción debe activarse (bloquear/ocultar).
        """
        user_groups = self.env.user.groups_id
        has_group = bool(rule.group_ids & user_groups)

        method = getattr(rule, "restriction_method", "exclude") or "exclude"

        if method == "exclude":
            return has_group
        elif method == "include":
            return not has_group
        return False

    def _default_get_compute_restrictions_fields(self):
        restrictions = (
            self.env["custom.field.restriction"]
            .sudo()
            .search([("model_name", "=", self._name)])
        )

        values = {}
        if not restrictions:
            return values

        for r in restrictions:
            field_name = False
            if r.visibility_field_id:
                field_name = r.visibility_field_id.name
            elif r.required_field_id:
                field_name = r.required_field_id.name
            elif r.readonly_field_id:
                field_name = r.readonly_field_id.name

            if field_name:
                values[field_name] = False

                if self._check_restriction_group(r):
                    values[field_name] = True

        return values

    def _compute_restrictions_fields(self):
        """Common compute method for all restrictions types"""
        restrictions = (
            self.env["custom.field.restriction"]
            .sudo()
            .search([("model_name", "=", self._name)])
        )

        for r in restrictions:
            applies_to_user = self._check_restriction_group(r)

            for record in self:
                if r.visibility_field_id:
                    field_name = r.visibility_field_id.name
                    record[field_name] = False
                if r.required_field_id:
                    field_name = r.required_field_id.name
                    record[field_name] = False
                if r.readonly_field_id:
                    field_name = r.readonly_field_id.name
                    record[field_name] = False

                field_to_set = False
                if r.visibility_field_id:
                    field_to_set = r.visibility_field_id.name
                elif r.required_field_id:
                    field_to_set = r.required_field_id.name
                elif r.readonly_field_id:
                    field_to_set = r.readonly_field_id.name

                if not field_to_set:
                    continue

                should_restrict = False

                if r.condition_domain:
                    try:
                        domain = safe_eval(r.condition_domain)
                        if record.filtered_domain(domain) and applies_to_user:
                            should_restrict = True
                    except Exception:
                        pass
                elif applies_to_user:
                    should_restrict = True

                if should_restrict:
                    record[field_to_set] = True
