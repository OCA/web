# Copyright 2022 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)


from odoo import fields, models


class ResUsersFake(models.Model):
    _inherit = "res.users"

    user_year_born = fields.Integer()
    user_year_now = fields.Integer()
