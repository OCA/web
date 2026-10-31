from odoo.tests.common import HttpCase, TransactionCase, tagged
from odoo.tools import convert_file, sql


class TestWebIrActionsActMultiUninstall(TransactionCase):
    def _uninstall_env(self):
        return self.env(
            context=dict(self.env.context, uninstall_web_ir_actions_act_multi=True)
        )

    def test_readable_fields(self):
        self.assertIn(
            "actions", self.env["ir.actions.act_multi"]._get_readable_fields()
        )

    def test_drop_table_keeps_ir_actions(self):
        model_id = self.env["ir.model"]._get("ir.actions.act_multi")
        self._uninstall_env()["ir.model"].browse(model_id.ids)._drop_table()
        self.assertTrue(sql.table_exists(self.env.cr, "ir_actions"))

    def test_drop_column_keeps_ir_actions_columns(self):
        field_ids = self.env["ir.model.fields"].search(
            [("model", "=", "ir.actions.act_multi"), ("store", "=", True)]
        )
        self.assertTrue(field_ids)
        self._uninstall_env()["ir.model.fields"].browse(field_ids.ids)._drop_column()
        for field_id in field_ids:
            self.assertTrue(
                sql.column_exists(self.env.cr, "ir_actions", field_id.name),
                field_id.name,
            )


@tagged("-at_install", "post_install")
class TestWebIrActionsActMultiTour(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # the tour relies on the demo data, load it if the database has no demo
        if not cls.env.ref(
            "web_ir_actions_act_multi.demo_action", raise_if_not_found=False
        ):
            convert_file(
                cls.env,
                "web_ir_actions_act_multi",
                "demo/ir_actions_act_multi_demo.xml",
                {},
                mode="init",
            )
        # without demo data the admin partner has no email, which is required
        # to save the form before the button's action is executed
        partner_id = cls.env.ref("base.partner_admin")
        if not partner_id.email:
            partner_id.email = "admin@example.com"

    def test_tour(self):
        self.start_tour(
            "/odoo/web_ir_actions_act_multi_demo",
            "web_ir_actions_act_multi",
            login="admin",
        )
