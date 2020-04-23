# Copyright 2015 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import base64
from odoo.tests.common import TransactionCase
from odoo.tools.misc import file_open
from odoo import http


class FakeRequest(object):
    def __init__(self, env):
        self.env = env

    def make_response(self, data, headers):
        return FakeResponse(data, headers)


class FakeResponse(object):
    def __init__(self, data, headers):
        self.data = data
        self.headers = dict(headers)


class TestWebFavicon(TransactionCase):
    def test_web_favicon(self):
        original_request = http.request
        http.request = FakeRequest(self.env)
        from ..controllers.web_favicon import WebFavicon
        company = self.env['res.company'].search([], limit=1)
        # default icon
        company.write({
            'favicon_backend': False,
            'favicon_backend_mimetype': False,
        })
        data = WebFavicon().icon()
        self.assertEqual(data.headers['Content-Type'], 'image/x-icon')
        # our own icon
        company.write({
            'favicon_backend': base64.b64encode(file_open(
                'web_favicon/static/description/icon.png', 'rb').read()),
            'favicon_backend_mimetype': 'image/png',
        })
        data = WebFavicon().icon()
        self.assertEqual(data.headers['Content-Type'],
                         company.favicon_backend_mimetype)
        http.request = original_request
