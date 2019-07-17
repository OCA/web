# Copyright 2017 Tecnativa - Pedro M. Baeza
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import common


class TestSignatureTracking(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestSignatureTracking, cls).setUpClass()
        cls.user = cls.env['res.users'].create({
            'name': 'Test User',
            'login': 'Test User',
            'email': 'test@example.com',
        })
        cls.user.lang = 'en_US'
        # Simple 1x1 transparent base64 encoded GIF
        cls.image = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        cls.attachment_obj = cls.env['ir.attachment']
        cls.message_obj = cls.env['mail.message']

    def test_signature_tracking(self):
        """We have to test in a tricky way, as res.users doesn't allow a
        direct chatter"""
        prev_attachment_num = self.attachment_obj.search_count([])
        prev_messages = self.message_obj.search([])
        self.user.digital_signature = self.image
        current_attachment_num = self.attachment_obj.search_count([])
        self.assertEqual(current_attachment_num - prev_attachment_num, 1)
        current_messages = self.message_obj.search([])
        message = current_messages - prev_messages
        self.assertIn('Signature has been created.', message.body)
        prev_messages = current_messages
        self.user.digital_signature = False
        current_messages = self.message_obj.search([])
        message = current_messages - prev_messages
        self.assertIn('Signature has been deleted.', message.body)
