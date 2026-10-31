# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.exceptions import UserError
from odoo.tests import TransactionCase, new_test_user


class TestExportData(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user_basic = new_test_user(
            cls.env, login="user_basic", groups="base.group_user"
        )
        cls.user_xlsx = new_test_user(
            cls.env,
            login="user_xlsx",
            groups="base.group_user,web_disable_export_group.group_export_xlsx_data",
        )

    def test_export_data_xlsx_group(self):
        partner = self.env["res.partner"].with_user(self.user_xlsx).search([], limit=1)
        res = partner.export_data(["name"])
        self.assertEqual(res["datas"], [[partner.name]])

    def test_export_data_no_group(self):
        partner = self.env["res.partner"].with_user(self.user_basic).search([], limit=1)
        with self.assertRaises(UserError):
            partner.export_data(["name"])

    def test_allow_export_does_not_imply_xlsx(self):
        allow_export = self.env.ref("base.group_allow_export")
        xlsx = self.env.ref("web_disable_export_group.group_export_xlsx_data")
        self.assertNotIn(xlsx, allow_export.implied_ids)
