# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import uuid

from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def _new_form_token(self):
        return uuid.uuid4().hex

    form_token = fields.Char(
        "Security Token",
        default=_new_form_token,
        help="Access token to access to the web form",
    )

    def _set_form_token(self):
        self.ensure_one()
        self.form_token = uuid.uuid4().hex
        return True
