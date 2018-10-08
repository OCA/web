# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import exceptions
from openerp.tests import common
from openerp.addons.bus.models.bus import json_dump
import mock


class TestResUsers(common.TransactionCase):

    def test_notify_info(self):
        bus_bus = self.env['bus.bus']
        domain = [
            ('channel', '=',
             json_dump(self.env.user.notify_info_channel_name))
        ]
        existing = bus_bus.search(domain)
        self.env.user.notify_info(
            message='message', title='title', sticky=True)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        self.assertEqual(
            '{"message":"message","sticky":true,"title":"title"}',
            news.message)

    def test_notify_warning(self):
        bus_bus = self.env['bus.bus']
        domain = [
            ('channel', '=',
             json_dump(self.env.user.notify_warning_channel_name))
        ]
        existing = bus_bus.search(domain)
        self.env.user.notify_warning(
            message='message', title='title', sticky=True)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        self.assertEqual(
            '{"message":"message","sticky":true,"title":"title"}',
            news.message)

    def test_notify_many(self):
        # check that the notification of a list of users is done with
        # a single call to the bus
        with mock.patch('openerp.addons.bus.models.bus.ImBus.sendmany'
                        ) as mockedSendMany:
            users = self.env.user.search([])
            self.assertTrue(len(users) > 1)
            users.notify_warning('message')
            self.assertEqual(1, mockedSendMany.call_count)
            self.assertEqual(len(users), len(mockedSendMany.call_args[0][0]))

    def test_notify_other_user(self):
        other_user = self.env.ref('base.user_demo')
        other_user_model = self.env['res.users'].sudo(other_user)
        with self.assertRaises(exceptions.UserError):
            other_user_model.browse(self.env.uid).notify_info('hello')

    def test_notify_admin_allowed_other_user(self):
        other_user = self.env.ref('base.user_demo')
        other_user.notify_info('hello')
