# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import json

from odoo import exceptions
from odoo.tests import common
from odoo.addons.bus.models.bus import json_dump
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
            message='message', title='title', sticky=True,
            show_reload=True, foo="bar"
        )
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        expected = ('{"message":"message","sticky":true,"title":"title",'
                    '"show_reload":true,"action":null,'
                    '"action_link_name":null,"foo":"bar"}')
        self.assertDictEqual(
            json.loads(expected),
            json.loads(news.message)
        )

    def test_notify_warning(self):
        bus_bus = self.env['bus.bus']
        domain = [
            ('channel', '=',
             json_dump(self.env.user.notify_warning_channel_name))
        ]
        existing = bus_bus.search(domain)
        self.env.user.notify_warning(
            message='message', title='title', sticky=True,
            show_reload=True, foo="bar"
        )
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        expected = ('{"message":"message","sticky":true,"title":"title",'
                    '"show_reload":true,"action":null,'
                    '"action_link_name":null,"foo":"bar"}')
        self.assertDictEqual(
            json.loads(expected),
            json.loads(news.message)
        )

    def test_notify_with_action(self):
        bus_bus = self.env['bus.bus']
        domain = [
            ('channel', '=',
             json_dump(self.env.user.notify_info_channel_name))
        ]
        existing = bus_bus.search(domain)
        self.env.user.notify_info(
            message='message', title='title', sticky=True,
            action={
                "type": "ir.actions.act_window",
                "view_mode": "form",
            },
            action_link_name="Open"
        )
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        # the action should be transformed by Odoo (clean_action)
        expected = ('{"message":"message","sticky":true,"title":"title",'
                    '"show_reload":false,"action":'
                    '{"type": "ir.actions.act_window", "view_mode":"form",'
                    '"flags":{},"views":[[false, "form"]]},'
                    '"action_link_name":"Open"}')
        self.assertDictEqual(
            json.loads(expected),
            json.loads(news.message)
        )

    def test_notify_many(self):
        # check that the notification of a list of users is done with
        # a single call to the bus
        with mock.patch('odoo.addons.bus.models.bus.ImBus.sendmany'
                        ) as mockedSendMany:
            users = self.env.user.search([(1, "=", 1)])
            self.assertTrue(len(users) > 1)
            users.notify_warning('message')

            self.assertEqual(1, mockedSendMany.call_count)

            # call_args is a tuple with args (tuple) & kwargs (dict). We check
            # positional arguments (args), hence the [0].
            pos_call_args = mockedSendMany.call_args[0]

            # Ensure the first positional argument is a list with as many
            # elements as we had users.
            first_pos_call_args = pos_call_args[0]
            self.assertIsInstance(first_pos_call_args, list)
            self.assertEqual(len(users), len(first_pos_call_args))

    def test_notify_other_user(self):
        other_user = self.env.ref('base.user_demo')
        other_user_model = self.env['res.users'].sudo(other_user)
        with self.assertRaises(exceptions.UserError):
            other_user_model.browse(self.env.uid).notify_info('hello')

    def test_notify_admin_allowed_other_user(self):
        other_user = self.env.ref('base.user_demo')
        other_user.notify_info('hello')
