# Copyright 2026 Jarsa
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import fields, models

from .ir_http import PARAM_ROWS


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    web_x2many_list_scroll_rows = fields.Integer(
        string="Visible Rows in Form Lists",
        config_parameter=PARAM_ROWS,
        help="Rows a list inside a form shows before it scrolls, with its header "
        "and its totals staying in sight. 0 leaves the lists as they are. A "
        "form can set its own number, or 0, on the field with "
        "options=\"{'scroll_rows': 15}\".",
    )
