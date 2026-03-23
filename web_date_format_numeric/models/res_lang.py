# Copyright 2026 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResLang(models.Model):
    _inherit = "res.lang"

    use_date_format_numeric = fields.Boolean(
        string="Use Numeric Date Format",
        help="Display dates in numeric format (e.g. 31/01/2026) "
        "instead of textual format (e.g. Jan 31, 2026).",
    )
