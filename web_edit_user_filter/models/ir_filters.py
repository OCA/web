# Copyright 2019 Onestein
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class IrFilters(models.Model):
    _inherit = 'ir.filters'

    facet = fields.Text()

    @api.model
    def get_filters(self, model, action_id=None):
        res = super().get_filters(model, action_id)
        ids = map(lambda f: f['id'], res)
        # Browse filters that are in res
        filters = self.browse(ids)
        for i, res_filter in enumerate(res):
            # Add the field 'facet' to the result
            res[i]['facet'] = filters.filtered(
                lambda f: f.id == res_filter['id']
            ).facet
        return res
