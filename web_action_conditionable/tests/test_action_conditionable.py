# -*- coding: utf-8 -*-

from mock import patch
from openerp.tests.common import TransactionCase
from ..controllers.main import MainController


class TestActionConditionable(TransactionCase):
    @patch('openerp.addons.web_action_conditionable.'
           'controllers.main.request')
    @patch('openerp.addons.web.controllers.main.request')
    def test_session_info(self, request, request2):
        # Mock
        request.env = self.env
        request2.env = self.env

        ctrl = MainController()
        res = ctrl.session_info()
        self.assertTrue('group_refs' in res)
