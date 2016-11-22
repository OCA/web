# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp.tests.common import HttpCase


class TestPublicSession(HttpCase):

    def test_ui_web(self):
        """ It should allow a Model query using public user """
        self.phantom_js("/web/tests?module=web_session_allow_public",
                        "",
                        )
