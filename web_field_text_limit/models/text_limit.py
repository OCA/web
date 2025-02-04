# Copyright 2025 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, fields, models, tools


class TextLimit(models.Model):
    _name = "text.limit"
    _description = "Text Limit"

    name = fields.Char("Usage", index=True, required=True)
    value = fields.Integer(required=True, default=40)

    _sql_constraints = [
        (
            "name_uniq",
            "unique (name)",
            """Only one value can be defined for each given usage!""",
        ),
    ]

    @api.model
    @tools.ormcache("application")
    def get_limit(self, application):
        self.flush(["name", "value"])
        self.env.cr.execute(
            "select value from text_limit where name=%s", (application,)
        )
        res = self.env.cr.fetchone()
        return res[0] if res else 2

    @api.model_create_multi
    def create(self, vals_list):
        res = super().create(vals_list)
        self.clear_caches()
        return res

    def write(self, data):
        res = super().write(data)
        self.clear_caches()
        return res

    def unlink(self):
        res = super().unlink()
        self.clear_caches()
        return res
