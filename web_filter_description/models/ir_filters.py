# -*- coding: utf-8 -*-
# Copyright 2018 Bejaoui Souheil <souheil_bejaoui@hotmail.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models, api


class IrFilters(models.Model):
    _inherit = 'ir.filters'

    description = fields.Text(string="Description", required=False)

    @api.model
    def get_filters(self, model, action_id=None):
        res = super(IrFilters, self).get_filters(model, action_id)
        ids = map(lambda f: f['id'], res)
        # Browse filters that are in res
        filters = self.browse(ids)
        for i, res_filter in enumerate(res):
            # Add the field 'description' to the result
            res[i]['description'] = filters.filtered(
                lambda f: f.id == res_filter['id']
            ).description
        return res
