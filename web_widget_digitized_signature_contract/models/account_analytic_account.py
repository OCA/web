# -*- coding: utf-8 -*-
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import _, api, fields, models


class AccountAnalyticAccount(models.Model):
    _inherit = 'account.analytic.account'

    user_id = fields.Many2one(
        comodel_name='res.users',
        string='Responsible',
        index=True,
        default=lambda self: self.env.user,
    )
    signature_image = fields.Binary(
        string='Signature',
        related='user_id.signature_image',
    )

    @api.multi
    def action_contract_send(self):
        self.ensure_one()
        template = self.env.ref(
            'web_widget_digitized_signature_contract.email_contract_template',
            False,
        )
        compose_form = self.env.ref('mail.email_compose_message_wizard_form',
                                    False)
        ctx = dict(
            default_model='account.analytic.account',
            default_res_id=self.id,
            default_use_template=bool(template),
            default_template_id=template and template.id or False,
            default_composition_mode='comment',
            mark_invoice_as_sent=True,
        )
        return {
            'name': _('Compose Email'),
            'type': 'ir.actions.act_window',
            'view_type': 'form',
            'view_mode': 'form',
            'res_model': 'mail.compose.message',
            'views': [(compose_form.id, 'form')],
            'view_id': compose_form.id,
            'target': 'new',
            'context': ctx,
        }
