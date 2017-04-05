# -*- coding: utf-8 -*-
# © 2017 Xavier Brochard
# License AGPL-3.0 or later (http://www.gnu.org/licenses/gpl.html).

import os
from odoo import models

# brouillon OCA/server-tools/blob/10.0/auto_backup/models/db_backup.py
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
