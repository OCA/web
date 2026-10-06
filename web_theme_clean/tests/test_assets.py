# Copyright 2026 Humanilog (https://humanilog.org)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import re

from odoo.tests import TransactionCase


class TestAssets(TransactionCase):
    def test_navbar_style(self):
        bundle = self.env["ir.qweb"]._get_asset_bundle("web.assets_backend", js=False)
        css = bundle.preprocess_css()
        self.assertFalse(bundle.css_errors)
        # A rule follows either another rule or the header comment of its file
        navbar = " ".join(re.findall(r"[}/]\s*\.o_main_navbar\s*\{([^}]*)\}", css))
        self.assertRegex(navbar, r"(?i)background:\s*#fff(fff)?\b")
        self.assertRegex(navbar, r"box-shadow:\s*inset 0 -1px 0")
