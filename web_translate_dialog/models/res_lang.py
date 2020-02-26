# Copyright 2019 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import models, fields


class ResLang(models.Model):

    _inherit = 'res.lang'

    tr_sequence = fields.Integer(
        string='Translation sequence',
        help='Defines the order of language to appear in translation dialog',
        default=10,
    )
