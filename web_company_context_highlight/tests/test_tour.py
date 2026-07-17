# Copyright 2026 Acsone
# @author Pierre Verkest <pierre.verkest@apycod.fr>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo.tests.common import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestWebCompanyContextHighlight(HttpCase):
    def test_company_context_highlight_tour(self):
        admin_user = self.env.ref("base.user_admin")
        company_b = self.env["res.company"].create({"name": "Company B"})

        admin_user.write(
            {
                "company_ids": [(4, company_b.id)],
            }
        )

        # Launch the single interactive tour
        self.start_tour("/odoo", "web_company_context_highlight_tour", login="admin")
