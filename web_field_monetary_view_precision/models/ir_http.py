# Copyright 2022 Yiğit Budak (https://github.com/yibudak)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models
from odoo.http import request


class Http(models.AbstractModel):
    _inherit = 'ir.http'

    def get_currencies(self):
        """
        Override of ir.http.get_currencies to specify view precision to the currencies.
        """
        Currency = request.env['res.currency']
        currencies = Currency.search([]).read(['symbol', 'position', 'view_precision'])
        return {c['id']: {'symbol': c['symbol'],
                          'position': c['position'],
                          'digits': [69, c['view_precision']]} for c in currencies}
