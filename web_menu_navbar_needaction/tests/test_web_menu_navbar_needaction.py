# -*- coding: utf-8 -*-
# Copyright 2015-2018 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase
from odoo.tools import mute_logger


class TestWebMenuNavbarNeedaction(TransactionCase):
    def test_web_menu_navbar_needaction(self):
        main_menus = self.env['ir.ui.menu'].search([('parent_id', '=', False)])
        data = main_menus.get_navbar_needaction_data()
        self.assertEqual(len(main_menus), len(data))
        with mute_logger('odoo.models'), self.assertRaises(ValidationError):
            main_menus[:1].write({'needaction_domain': '['})
