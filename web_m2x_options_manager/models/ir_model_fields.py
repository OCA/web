# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.osv.expression import AND


class IrModelFields(models.Model):
    _inherit = "ir.model.fields"

    can_have_options = fields.Boolean(compute="_compute_can_have_options", store=True)
    comodel_id = fields.Many2one(
        "ir.model", compute="_compute_comodel_id", store=True, index=True
    )

    @api.depends("ttype")
    def _compute_can_have_options(self):
        for field in self:
            field.can_have_options = field.ttype in ("many2many", "many2one")

    @api.depends("relation")
    def _compute_comodel_id(self):
        empty = self.env["ir.model"]
        getter = self.env["ir.model"]._get
        for field in self:
            if field.relation:
                field.comodel_id = getter(field.relation)
            else:
                field.comodel_id = empty

    @api.model
    def name_search(self, name="", args=None, operator="ilike", limit=100):
        # OVERRIDE: allow searching by field tech name if the correct context key is
        # used; in this case, fields fetched by tech name are prepended to other fields
        result = super().name_search(name, args, operator, limit)
        if not (name and self.env.context.get("search_by_technical_name")):
            return result
        domain = AND([args or [], [("name", operator, name)]])
        new_fields = self.search_read(domain, fields=["display_name"], limit=limit)
        new_result = {f["id"]: f["display_name"] for f in new_fields}
        while result and not (limit and 0 < limit <= len(new_result)):
            field_id, field_display_name = result.pop(0)
            if field_id not in new_result:
                new_result[field_id] = field_display_name
        return list(new_result.items())

    @api.model
    def _search(self, args, **kwargs):
        # OVERRIDE: allow defining filtering custom domain on model/comodel when
        # searching fields for O2M list views on ``m2x.create.edit.option``
        if self.env.context.get("o2m_list_view_m2x_domain"):
            args = AND([list(args or []), self.env.context["o2m_list_view_m2x_domain"]])
        return super()._search(args, **kwargs)
