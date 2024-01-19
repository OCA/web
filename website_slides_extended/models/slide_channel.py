# © 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class Channel(models.Model):
    _inherit = 'slide.channel'

    slide_ids = fields.One2many(copy=True)
