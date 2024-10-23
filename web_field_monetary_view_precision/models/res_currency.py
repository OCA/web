# Copyright 2022 Yiğit Budak (https://github.com/yibudak)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields


class ResCurrency(models.Model):
    _inherit = 'res.currency'

    def _get_default_precision(self):
        return self.env['decimal.precision'].precision_get('Account')

    view_precision = fields.Integer('View Precision',
                                    default=_get_default_precision,
                                    help="Number of digits after the decimal"
                                         " separator when displaying the value"
                                         " for monetary field. Default is"
                                         " account decimal precision.")

    _sql_constraints = [
        ('currency_view_precision_positive', 'CHECK(view_precision >= 0)',
         'View precision must be bigger or equal than zero'),
    ]
