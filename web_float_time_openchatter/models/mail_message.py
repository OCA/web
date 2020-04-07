# Copyright 2020 Trobz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class MailMessage(models.Model):
    _inherit = 'mail.message'

    @api.model
    def _message_read_dict_postprocess(self, messages, message_tree):
        res = super(MailMessage, self)._message_read_dict_postprocess(
            messages, message_tree)

        # Add field_name to tracking_value_ids
        mtv_env = self.env['mail.tracking.value']
        for message_dict in messages:
            tracking_values = message_dict.get('tracking_value_ids', [])
            for tracking_value in tracking_values:
                tracking_value_id = tracking_value.get('id', False)
                if tracking_value_id:
                    mtv_rec = mtv_env.sudo().browse(tracking_value_id)
                    field_name = mtv_rec.field
                    tracking_value['field_name'] = field_name

        return res
