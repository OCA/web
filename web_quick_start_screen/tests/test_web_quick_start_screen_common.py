from odoo import Command
from odoo.tests.common import TransactionCase


class WebQuickStartScreenCommon(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))

        cls.quick_start_screen_action_1 = cls.env["quick.start.screen.action"].create(
            {
                "name": "Contacts",
                "description": "<span>Browse <b>contacts</b></span>",
                "action_ref_id": f"ir.actions.act_window,"
                f"{cls.env.ref('base.action_partner_form').id}",
                "icon_name": "fa-users",
                "color": 7,
            }
        )

        cls.quick_start_screen_action_2 = cls.env["quick.start.screen.action"].create(
            {
                "name": "Access rights",
                "description": "<span>Explore <b>access rights</b></span>",
                "action_ref_id": f"ir.actions.act_window,"
                f"{cls.env.ref('base.ir_access_act').id}",
                "icon_name": "fa-eyes",
                "color": 4,
            }
        )

        cls.start_screen_1 = cls.env["quick.start.screen"].create(
            {
                "name": "start_screen_1",
                "action_ids": [
                    Command.link(cls.quick_start_screen_action_1.id),
                    Command.link(cls.quick_start_screen_action_2.id),
                ],
            }
        )
