# -*- coding: utf-8 -*-
# Copyright 2017 Onestein (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase
from odoo.addons.web_chatter_paste.controllers.main \
    import ChatterPasteController


class TestWebChatterPaste(TransactionCase):
    def test_controller(self):
        partner_id = self.ref('base.main_partner')
        attachment_obj = self.env['ir.attachment']
        attachment_count = attachment_obj.search_count([
            ('res_model', '=', 'res.partner'),
            ('res_id', '=', partner_id)
        ])
        controller = ChatterPasteController()
        controller.upload_attachment(
            '_',
            'res.partner',
            partner_id,
            'test.png',
            'image/png',
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6'
            'QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFN'
            'vZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAAMSURBVBhXY/j//z8ABf4C/q'
            'c1gYQAAAAASUVORK5CYII='
        )
        new_attachment_count = attachment_obj.search_count([
            ('res_model', '=', 'res.partner'),
            ('res_id', '=', partner_id)
        ])
        self.assertEqual(attachment_count + 1, new_attachment_count)
