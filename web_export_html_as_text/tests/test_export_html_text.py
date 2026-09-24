# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.orm.model_classes import add_to_registry
from odoo.tests.common import TransactionCase


class TestExportHtmlText(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        from .test_models import TestExportHtmlText

        add_to_registry(cls.registry, TestExportHtmlText)
        cls.registry._setup_models__(cls.env.cr, ["test.export.html.text"])
        cls.registry.init_models(
            cls.env.cr, ["test.export.html.text"], {"models_to_check": True}
        )
        cls.addClassCleanup(cls.registry.__delitem__, "test.export.html.text")
        cls.record = cls.env["test.export.html.text"].create(
            {
                "name": "Test 1",
                "narration": "<p>This is a <strong>test</strong> HTML content.</p>",
            }
        )

    def test_convert_to_export_html(self):
        res = self.record.export_data(["narration"])
        self.assertEqual(
            res["datas"][0][0], "<p>This is a <strong>test</strong> HTML content.</p>"
        )
        res = self.record.with_context(export_html_as_text=True).export_data(
            ["narration"]
        )
        self.assertEqual(res["datas"][0][0], "This is a *test* HTML content.")
