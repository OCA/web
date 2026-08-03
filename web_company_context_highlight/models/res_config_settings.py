# Copyright 2026 Acsone
# @author Pierre Verkest <pierre.verkest@apycod.fr>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    web_company_context_highlight_color = fields.Char(
        string="Company Highlight Color",
        default="#ffc107",
        config_parameter="web_company_context_highlight.color",
        help="Background color used to highlight the company switcher "
        "when in multi-company context.",
    )
    web_company_context_highlight_text_color = fields.Char(
        string="Company Highlight Text Color",
        default="#212529",
        config_parameter="web_company_context_highlight.text_color",
        help="Text color used to highlight the company switcher "
        "when in multi-company context.",
    )
