# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models, fields


class MailActivityMixin(models.AbstractModel):
    _inherit = 'mail.activity.mixin'

    activity_type_icon = fields.Char(
        string='Activity Type Icon',
        related='activity_ids.icon',
    )
