# coding: utf-8
# © 2016 David BEAL @ Akretion <david.beal@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

# import logging


from openerp.tests import common


class TestHelpPopup(common.TransactionCase):

    def test_qweb_help_report(self):
        partner_act = self.env.ref('base.action_partner_form')
        return partner_act.button_open_help_popup()

    def test_advanced_user_model_help(self):
        """ test if advanced_help_model field in 'ir.actions.act_window'
            propagate changes in 'ir.model' advanced_help field
        """
        partner_act = self.env.ref('base.action_partner_form')
        partner_act.with_context(install_mode=True).write(
            {'advanced_help_model': 'new_content'})
        partner_mod = self.env['ir.model'].search(
            [('model', '=', 'res.partner')])
        self.assertEqual(
            partner_mod.advanced_help, 'new_content',
            "advanced_help and avanced_help_model fields are not equals")
