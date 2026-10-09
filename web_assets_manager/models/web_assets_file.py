# © 2024 initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class WebAssetsFile(models.Model):
    _name = "web.assets.file"
    _description = "Web Assets File"
    _order = "mimetype, name"

    asset_id = fields.Many2one(
        "web.assets", required=True, ondelete="cascade", readonly=True
    )
    name = fields.Char(readonly=True)
    include = fields.Boolean(default=True)
    mimetype = fields.Char(readonly=True)
    module = fields.Char(compute="_compute_module", store=True)
    size = fields.Integer(readonly=True)
    size_included = fields.Integer(compute="_compute_size_included", store=True)

    @api.depends("size", "include")
    def _compute_size_included(self):
        for rec in self:
            rec.size_included = rec.size if rec.include else 0

    @api.depends("name")
    def _compute_module(self):
        for rec in self:
            if "/" in rec.name:
                rec.module = rec.name.strip("/").split("/", 1)[0]
            else:
                rec.module = False

    def action_include(self):
        self.write({"include": True})

    def action_exclude(self):
        self.write({"include": False})
