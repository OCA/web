# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models, api, fields


class ResUsers(models.Model):
    _inherit = 'res.users'

    matrix_display_name = fields.Char(compute="_compute_matrix_display_name")

    @api.depends("name", "email")
    def _compute_matrix_display_name(self):
        for user in self:
            user.matrix_display_name = "%s (%s)" % (user.name, user.email)
