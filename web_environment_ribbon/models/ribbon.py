# -*- coding: utf-8 -*-
# © 2017 Xavier Brochard
# License AGPL-3.0 or later (http://www.gnu.org/licenses/gpl.html).

import os
from odoo import models, fields

class DbName(models.Model):
    
    ribbon.name = fields.Char(
        default=lambda self: self._default_name(),
        help='Text printed on the Ribbon',
        required=True
    )
    @api.model
    def _default_name(self):
        """Default to database name."""
        return self.env.cr.dbname()
