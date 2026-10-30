# Copyright 2026 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestUIFilterHeaderButton(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env["ir.ui.view"].create(
            {
                "name": "res.partner.search.header.button.test",
                "model": "res.partner",
                "inherit_id": cls.env.ref("base.view_res_partner_filter").id,
                "arch": """
                    <xpath expr="//search" position="inside">
                        <filter
                            string="Header Companies"
                            name="header_companies"
                            domain="[('is_company', '=', True)]"
                            context="{'shown_in_panel': {
                                'icon': 'business', 'iconClass': 'oi-filled'
                            }}"
                        />
                        <filter
                            string="Header Kind"
                            name="header_kind"
                            context="{'group_by': 'is_company', 'shown_in_panel': True}"
                        />
                        <filter
                            string="Header Legacy Icon"
                            name="header_legacy_icon"
                            domain="[('is_company', '=', False)]"
                            context="{'shown_in_panel': {'icon': 'fa fa-star'}}"
                        />
                        <filter
                            string="Header Created"
                            name="header_created"
                            date="create_date"
                            context="{'shown_in_panel': True}"
                        />
                        <filter
                            string="Header Month"
                            name="header_month"
                            context="{
                                'group_by': 'create_date:month', 'shown_in_panel': True
                            }"
                        />
                    </xpath>
                """,
            }
        )

    def test_filter_header_button(self):
        self.start_tour(
            "/odoo/action-base.action_partner_form?view_type=list",
            "web_filter_header_button_tour",
            login="admin",
        )
