from unittest.mock import patch

from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestDocumentLayoutOnchange(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Company = cls.env["res.company"]
        cls.company = cls.Company.create({"name": "WZ Co", "report_font_size": "11"})
        cls.Wizard = cls.env["base.document.layout"]

    def test_onchange_when_compute_preview_absent_does_nothing(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        prev = getattr(wiz, "preview", None)
        wiz.report_font_size = "10"

        with patch.object(type(wiz), "_compute_preview", new=None, create=True):
            wiz._onchange_report_font_size()

        self.assertEqual(getattr(wiz, "preview", None), prev)

    def test_onchange_handles_compute_exception_sets_preview_false(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        self.assertIn("preview", wiz._fields)
        wiz.report_font_size = "14"

        with patch.object(
            type(wiz), "_compute_preview", side_effect=Exception("boom"), create=True
        ):
            wiz._onchange_report_font_size()

        self.assertFalse(bool(wiz.preview))

    def test_onchange_updates_wizard_field_without_crash(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        wiz.report_font_size = "14"
        wiz._onchange_report_font_size()
        self.assertEqual(wiz.report_font_size, "14")
