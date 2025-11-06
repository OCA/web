# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models
from odoo.osv.expression import AND


class IrModelFields(models.Model):
    _inherit = "ir.model.fields"

    @api.model
    def name_search(self, name="", args=None, operator="ilike", limit=100):
        # OVERRIDE: allow searching by field tech name if the correct context key is
        # used; in this case, fields fetched by tech name are prepended to other fields
        res = super().name_search(name, args, operator, limit)
        if not (name and self.env.context.get("search_by_technical_name")):
            return res
        domain = AND([args or [], [("name", operator, name)]])
        new_fields = self.search_read(domain, fields=["display_name"], limit=limit)
        new_res = {f["id"]: f["display_name"] for f in new_fields}
        while res and (not limit or limit <= 0 or len(new_res) <= limit):
            fid, fname = res.pop(0)
            if fid not in new_res:
                new_res[fid] = fname
        return list(new_res.items())
