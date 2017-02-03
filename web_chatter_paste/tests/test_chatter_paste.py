# -*- coding: utf-8 -*-
# © 2017 Onestein (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase
from odoo.addons.web_chatter_paste.controllers.main import \
    ChatterPasteController


class TestChatterPaste(TransactionCase):

    def test_upload(self):
        controller = ChatterPasteController()
        id = self.ref('base.res_partner_2')
        data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c' \
               '6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVY' \
               'dFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAAMSURBVBhXY/j//z8A' \
               'Bf4C/qc1gYQAAAAASUVORK5CYII='
        controller.upload_attachment('upload_cb',
                                     'res.partner',
                                     id,
                                     'test.png',
                                     'image/png',
                                     data
                                     )
