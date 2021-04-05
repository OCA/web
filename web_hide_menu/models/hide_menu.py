# Copyright (C) 2021 Open Source Integrators
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class HideMenu(models.Model):
    _name = "hide.menu"
    _rec_name = "menu_id"

    user_id = fields.Many2one(
        "res.users", string="User", default=lambda self: self.env.user.id
    )
    menu_id = fields.Many2one("ir.ui.menu", string="Menu", required=True)

    @api.model
    def create(self, values):
        self.env["ir.ui.menu"].clear_caches()
        return super(HideMenu, self).create(values)

    def write(self, values):
        self.env["ir.ui.menu"].clear_caches()
        return super(HideMenu, self).write(values)
