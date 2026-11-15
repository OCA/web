# Copyright 2026 Roberto Fichera
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    listpanel_auto_panel = fields.Boolean(
        string="Show the panel on every form opened from a list",
        config_parameter="web_form_listpanel.auto_panel",
    )
