# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class IrModel(models.Model):
    _inherit = "ir.model"

    m2x_create_edit_option_ids = fields.One2many(
        "m2x.create.edit.option",
        "model_id",
    )

    def button_empty(self):
        for ir_model in self:
            ir_model._empty_m2x_create_edit_option()

    def button_fill(self):
        for ir_model in self:
            ir_model._fill_m2x_create_edit_option()

    def _empty_m2x_create_edit_option(self):
        """Removes every option for model ``self``"""
        self.ensure_one()
        self.m2x_create_edit_option_ids.unlink()

    def _fill_m2x_create_edit_option(self):
        """Adds every missing field option for model ``self``"""
        self.ensure_one()
        existing = self.m2x_create_edit_option_ids.mapped("field_id")
        valid = self.field_id.filtered(lambda f: f.ttype in ("many2many", "many2one"))
        vals = [(0, 0, {"field_id": f.id}) for f in valid - existing]
        self.write({"m2x_create_edit_option_ids": vals})


class IrModelFields(models.Model):
    _inherit = "ir.model.fields"

    @api.model
    def name_search(self, name="", args=None, operator="ilike", limit=100):
        res = super().name_search(name, args, operator, limit)
        if not (name and self.env.context.get("search_by_technical_name")):
            return res
        domain = list(args or []) + [("name", operator, name)]
        new_fids = self.search(domain, limit=limit).ids
        for fid in [x[0] for x in res]:
            if fid not in new_fids:
                new_fids.append(fid)
        if limit and limit > 0:
            new_fids = new_fids[:limit]
        return self.browse(new_fids).sudo().name_get()
