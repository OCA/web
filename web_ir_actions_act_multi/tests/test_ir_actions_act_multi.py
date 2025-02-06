from odoo.tests.common import TransactionCase

class TestIrActionsActMulti(TransactionCase):

    def setUp(self):
        super(TestIrActionsActMulti, self).setUp()
        self.IrActionsActMulti = self.env["ir.actions.act_multi"]

    def test_create_ir_actions_act_multi(self):
        action = self.IrActionsActMulti.create(
            {
                "name": "Test Action",
                "type": "ir.actions.act_multi",
            }
        )
        self.assertEqual(
            action.type,
            "ir.actions.act_multi",
            "Default type should be 'ir.actions.act_multi'.",
        )

    def test_get_readable_fields(self):
        action = self.IrActionsActMulti.create(
            {
                "name": "Test Action",
                "type": "ir.actions.act_multi",
            }
        )
        readable_fields = action._get_readable_fields()
        self.assertIn(
            "actions",
            readable_fields,
            "The 'actions' should be in the readable fields.",
        )
