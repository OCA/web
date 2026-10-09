# Copyright 2026 Ecosoft Co., Ltd. (https://ecosoft.co.th)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.exceptions import ValidationError


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    web_font = fields.Selection(
        selection="_get_web_font_selection",
        string="Backend Font",
        config_parameter="web_font.font",
        help="Font used in the backend. Leave empty to use the default Odoo fonts.",
    )
    web_font_size = fields.Integer(
        string="Font Size (%)",
        config_parameter="web_font.size",
        help="Scale of the font. Leave 0 to scale it automatically, so that it "
        "looks as big as the default Odoo fonts.",
    )

    @api.constrains("web_font_size")
    def _check_web_font_size(self):
        for rec in self:
            if rec.web_font_size and not 50 <= rec.web_font_size <= 200:
                raise ValidationError(
                    self.env._("Font Size must be 0 or between 50 and 200.")
                )

    @api.model
    def _get_web_font_selection(self):
        """Same fonts as the Document Layout, so modules adding a font to
        res.company (selection_add) make it available here too"""
        return self.env["res.company"]._fields["font"]._description_selection(self.env)
