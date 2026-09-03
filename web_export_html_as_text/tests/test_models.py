# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class TestExportHtmlText(models.Model):
    _name = "test.export.html.text"
    _description = "Test Export Html As Text Model"

    name = fields.Char()
    narration = fields.Html()
