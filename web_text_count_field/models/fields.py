# Copyright 2019 Camptocamp
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields


class TextCount(fields.Text):

    def __init__(self, string, size=128, **kwargs):
        assert size, "Size is mandatory in text_count field"
        super().__init__(string=string, size=size, **kwargs)


fields.TextCount = TextCount
