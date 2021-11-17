# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import models
from odoo.http import SessionExpiredException


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    @classmethod
    def _auth_method_user(cls):
        try:
            return super(IrHttp, cls)._auth_method_user()
        except SessionExpiredException:
            return cls._auth_method_public()
