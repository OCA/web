# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo_test_helper import FakeModelLoader

from odoo.tests.common import TransactionCase


class TestExportHtmlText(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.loader = FakeModelLoader(cls.env, cls.__module__)
        cls.loader.backup_registry()
        from .test_models import TestExportHtmlText

        cls.loader.update_registry((TestExportHtmlText,))
        cls.test_model = cls.env.ref(
            "web_export_html_as_text.model_test_export_html_text"
        )
        cls.html_field = cls.env["ir.model.fields"]._get(
            "test.export.html.text", "narration"
        )
        cls.record = cls.env["test.export.html.text"].create(
            {
                "name": "Test 1",
                "narration": "<p>This is a <strong>test</strong> HTML content.</p>",
            }
        )

    @classmethod
    def tearDownClass(cls):
        cls.loader.restore_registry()
        super().tearDownClass()

    def test_convert_to_export_html(self):
        res = self.record.export_data(["narration"])
        self.assertEqual(
            res["datas"][0][0], "<p>This is a <strong>test</strong> HTML content.</p>"
        )
        res = self.record.with_context(export_html_as_text=True).export_data(
            ["narration"]
        )
        self.assertEqual(res["datas"][0][0], "This is a *test* HTML content.")
