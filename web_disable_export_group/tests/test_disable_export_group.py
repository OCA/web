# Copyright 2018 Onestein
# Copyright 2019 Alexandre Díaz - <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from mock import patch
from odoo.api import Environment
from odoo.tests.common import SavepointCase


class TestDisableExportGroup(SavepointCase):
    @patch('odoo.addons.base_setup.models.ir_http.request')
    @patch('odoo.addons.web_disable_export_group.models.ir_http.request')
    @patch('odoo.addons.web.models.ir_http.request')
    @patch('odoo.addons.web_tour.models.ir_http.request')
    def test_session_info(self, request, request1, request2, request3):
        request.env = self.env
        request1.env = self.env
        request2.env = self.env
        request3.env = self.env
        session_info = self.env['ir.http'].session_info()
        self.assertTrue(session_info['group_export_data'])

    @patch('odoo.addons.base_setup.models.ir_http.request')
    @patch('odoo.addons.web_disable_export_group.models.ir_http.request')
    @patch('odoo.addons.web.models.ir_http.request')
    @patch('odoo.addons.web_tour.models.ir_http.request')
    def test_session_info_not_allowed(self, request, request1, request2,
                                      request3):
        demo_env = Environment(
            self.env.cr,
            self.env.ref('base.default_user').id,
            {}
        )
        request.env = demo_env
        request1.env = demo_env
        request2.env = demo_env
        request3.env = demo_env
        session_info = demo_env['ir.http'].session_info()
        self.assertFalse(session_info['group_export_data'])
