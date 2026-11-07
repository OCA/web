# Copyright 2022 Hynsys Technologies
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    chatter_position = fields.Selection(
        [
            ("auto", "Responsive"),
            ("bottom", "Bottom"),
            ("sided", "Sided"),
        ],
        default="auto",
        user_writeable=True,
    )
