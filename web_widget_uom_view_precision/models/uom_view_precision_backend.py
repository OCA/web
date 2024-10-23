from odoo import api, models


class UomViewPrecisionBackend(models.AbstractModel):

    _name = 'uom.view.precision.backend'
    _description = 'Uom View Precision Backend'

    @api.model
    def get_uom_view_precisions(self):
        """
        This method returns the precision data from uom.uom model.
        :return: dictionary
        """
        uoms = self.env['uom.uom'].search([])
        if uoms:
            return {u['id']: u['view_precision'] for u in uoms}
        else:
            return {}
