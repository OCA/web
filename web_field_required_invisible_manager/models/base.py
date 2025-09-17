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

    def _default_get_compute_restrictions_fields(self):
        restrictions_ids = self.env["custom.field.restriction"]._get_ids_by_model(
            self._name
        )
        values = {}
        if not restrictions_ids:
            return values

        for r in self.env["custom.field.restriction"].browse(restrictions_ids):
            if r.visibility_field_id:
                field_name = r.visibility_field_id.name
                values[field_name] = False
            if r.required_field_id:
                field_name = r.required_field_id.name
                values[field_name] = False
            if r.readonly_field_id:
                field_name = r.readonly_field_id.name
                values[field_name] = False
            if r.group_ids:
                if r.group_ids & self.env.user.groups_id:
                    values[field_name] = True
        return values

    def _compute_restrictions_fields(self):
        """Common compute method for all restrictions types"""
        restrictions_ids = self.env["custom.field.restriction"]._get_ids_by_model(
            self._name
        )
        for r in self.env["custom.field.restriction"].browse(restrictions_ids):
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
                if r.condition_domain:
                    filtered_rec_id = record.filtered_domain(
                        safe_eval(r.condition_domain)
                    )
                    if filtered_rec_id and r.group_ids & self.env.user.groups_id:
                        record[field_name] = True
                elif r.group_ids:
                    if r.group_ids & self.env.user.groups_id:
                        record[field_name] = True
