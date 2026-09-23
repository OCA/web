# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    session_auto_close_timeout = fields.Integer(
        string="Session Auto-Close Timeout (seconds)",
        config_parameter="web_session_auto_close.timeout",
        default=600,
    )
