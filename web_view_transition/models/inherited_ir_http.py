# Copyright 2019 Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.http import request


class Http(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        vals = super().session_info()
        vals.update({
            'view_transition_mode': request.env.user.view_transition_mode,
        })
        return vals
