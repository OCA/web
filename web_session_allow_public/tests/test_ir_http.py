# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

import mock

from openerp.http import SessionExpiredException
from openerp.tests.common import HttpCase, TransactionCase


MODULE_PATH = 'openerp.addons.web_session_allow_public.models.ir_http'


class TestIrHttp(TransactionCase):

    def setUp(self):
        super(TestIrHttp, self).setUp()
        self.Model = self.env['ir.http']

    @mock.patch('%s.super' % MODULE_PATH)
    def test_auth_method_user(self, _super):
        """ It should return public session on SessionExpiredException """
        _super.auth_method_user.side_effect = SessionExpiredException
        with mock.patch.object(self.Model, '_auth_method_public') as public:
            res = self.Model._auth_method_user()
            self.assertEqual(res, public())


class TestPublicSession(HttpCase):

    def test_ui_web(self):
        """ It should allow a Model query using public user """
        self.phantom_js("/web/tests?module=web_session_allow_public",
                        "",
                        login="public",
                        )
