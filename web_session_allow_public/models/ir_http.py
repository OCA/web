# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp import models
from openerp.http import request, SessionExpiredException

import pdb


class IrHttp(models.Model):

    _inherit = 'ir.http'

    def _auth_method_user(self):
        try:
            return super(IrHttp, self)._auth_method_user()
        except SessionExpiredException:
            return self._auth_method_public()
