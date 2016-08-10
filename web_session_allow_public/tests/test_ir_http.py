# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

import mock

from openerp.tests.common import HttpCase

from openerp.addons.base.ir.ir_http import ir_http


MODULE_PATH = 'openerp.addons.base.ir.ir_http'


class TestIrHttp(HttpCase):

    @mock.patch('%s.request' % MODULE_PATH)
    def test_public_session(self, request):
        """ It should allow HTTP authentication on public user """
        request.session.uid = False
        with mock.patch.object(
            ir_http, '_auth_method_public'
        ) as _auth_method_public:
            res = self.env['ir.http']._auth_method_user()
            self.assertEqual(res, _auth_method_public())
