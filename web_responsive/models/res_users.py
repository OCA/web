# Copyright 2023 Onestein - Anjeel Haria
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    allow_attachment_preview = fields.Selection(
        [
            ("yes", "Yes"),
            ("no", "No"),
        ],
        default="no",
        help="Allows attachments to be previewed in form view by default",
    )

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + ["allow_attachment_preview"]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + ["allow_attachment_preview"]
