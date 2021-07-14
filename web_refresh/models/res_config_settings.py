# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    group_web_refresh_watch_changes = fields.Boolean(
        "Allow refresh on server changes",
        implied_group="web_refresh.group_watch_changes",
    )
    group_web_refresh_allow_refresh_every = fields.Boolean(
        "Allow periodic refresh", implied_group="web_refresh.group_allow_refresh_every"
    )
    web_refresh_min_refresh_every = fields.Integer(
        "Minimum refresh timeout",
        config_parameter="web_refresh.min_refresh_every",
        default=60,
    )
    web_refresh_default_refresh_every = fields.Integer(
        "Default refresh timeout",
        config_parameter="web_refresh.default_refresh_every",
        default=60,
    )
