# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import mock

import odoo.tests.common as common
from .common import TestWizardCommon


class TestHelpOnline(TestWizardCommon, common.TransactionCase):

    def test_get_page_url(self):
        model = 'res.partner'
        help_online = self.env['help.online']
        user = self.env.user
        group_writer = self.env.ref('help_online.help_online_group_writer')
        group_reader = self.env.ref('help_online.help_online_group_reader')
        self.assertTrue(user.has_group('help_online.help_online_group_writer'))
        website = self.env['website']
        with mock.patch.object(website.__class__,
                               'search_pages') as search_pages:
            # The expected page dosn't exist
            search_pages.return_value = []
            info = help_online.get_page_url(model, 'form')
            self.assertDictEqual(
                {'exists': False,
                 'title': 'Create Help page for Partner',
                 'url': 'website/add/help-res-partner'}, info,
                "If the user is member of help_online_group_writer "
                "and the page doesn't exist, the module should return an url "
                "to create the page")
            # remove user of group writer.
            group_writer.write({'users': [(3, self.env.user.id)]})
            info = help_online.get_page_url(model, 'form')
            self.assertDictEqual(
                {}, info,
                "If the user is not member of help_online_group_writer "
                "and the page doesn't exist, the module should return an "
                "empty dict")
            # The expected page exists
            search_pages.return_value = [{'loc': 'pages/help-res-partner'}]
            self.assertTrue(
                user.has_group('help_online.help_online_group_reader'))
            info = help_online.get_page_url(model, 'form')
            self.assertDictEqual(
                {'exists': True,
                 'title': 'Help on Partner',
                 'url': 'pages/help-res-partner#form'}, info,
                "If the user is member of help_online_group_reader "
                "and the page exists, the module should return an url "
                "to the page")
            # remove user from group reader
            group_reader.write({'users': [(3, self.env.user.id)]})
            info = help_online.get_page_url(model, 'form')
            self.assertDictEqual(
                {}, info,
                "If the user is not member of help_online_group_reader "
                "and the page exists, the module should return an empty dict")
