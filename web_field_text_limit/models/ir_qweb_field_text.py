# Copyright 2025 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from markupsafe import escape

from odoo import api, models

from odoo.addons.base.models.ir_qweb_fields import nl2br


class IrQwebFieldText(models.AbstractModel):
    _inherit = "ir.qweb.field.text"

    @api.model
    def value_to_html(self, value, options):
        res = super().value_to_html(value, options)
        if value and options.get("text_limit"):
            limit = self.env["text.limit"].get_limit(options["text_limit"])
            if len(value) > limit:
                res = nl2br(escape(value[:limit] + "..."))
        return res
