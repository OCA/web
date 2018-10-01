# -*- coding: utf-8 -*-
# Copyright 2018 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models


class IrFilters(models.Model):
    _inherit = 'ir.filters'

    is_system = fields.Boolean(
        string="System filter",
        help="Define if this filter will be used for system purpose "
             "(if yes, system filters are not loaded into views)",
        default=False,
    )

    @api.model
    def get_filters(self, model, action_id=None):
        """
        Inherit to remove ir.filters where the is_system is True.
        :param model: str
        :param action_id: int (optional)
        :return: list of dict
        """
        result = super(IrFilters, self).get_filters(model, action_id=action_id)
        if result:
            result = self._remove_system_filters(result)
        return result

    @api.model
    def _remove_system_filters(self, result):
        """
        Remove system filters from given result
        :param result: list of dict
        :return: list of dict
        """
        # Load every id
        filter_ids = [r.get('id') for r in result]
        # Get only concerned filters where is_system is True
        system_filter_ids = self.search([
            ('id', 'in', filter_ids),
            ('is_system', '=', True),
        ]).ids
        # If no System filter, return directly the original result
        if not system_filter_ids:
            return result
        # Re-create a list without system filters.
        return [f for f in result if f.get('id') not in system_filter_ids]
