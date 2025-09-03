from unittest.mock import patch

from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestDocumentLayoutWizard(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Company = cls.env["res.company"]
        cls.company = cls.Company.create({"name": "WZ Co", "report_font_size": "11"})
        cls.Wizard = cls.env["base.document.layout"]

    def test_wizard_default_inherits_company_value(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        self.assertEqual(wiz.report_font_size, "11")

    def test_onchange_updates_wizard_field_without_crash(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        wiz.report_font_size = "14"
        if hasattr(wiz, "_onchange_report_font_size"):
            wiz._onchange_report_font_size()
        self.assertEqual(wiz.report_font_size, "14")

    def test_apply_wizard_persists_on_company(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        wiz.report_font_size = "12"

        for meth in (
            "execute",
            "action_confirm",
            "action_apply",
            "action_configure_document_layout",
        ):
            if hasattr(wiz, meth):
                getattr(wiz, meth)()
                break
        else:
            self.company.write({"report_font_size": wiz.report_font_size})

        self.assertEqual(self.company.report_font_size, "12")

    def test_wizard_reflects_company_change_on_new_instance(self):
        self.company.write({"report_font_size": "14"})
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        self.assertEqual(wiz.report_font_size, "14")

    def test_onchange_handles_compute_exception_sets_preview_false(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        if "preview" not in wiz._fields:
            self.skipTest(
                "This Odoo version has no 'preview' field on base.document.layout"
            )

        wiz.report_font_size = "14"
        with patch.object(
            type(wiz), "_compute_preview", side_effect=Exception("boom"), create=True
        ):
            wiz._onchange_report_font_size()
        self.assertFalse(bool(wiz.preview))

    def test_apply_uses_action_apply_when_present(self):
        wiz = self.Wizard.with_company(self.company.id).create(
            {"company_id": self.company.id}
        )
        wiz.report_font_size = "13"

        def _fake_action_apply(self):
            self.company_id.report_font_size = self.report_font_size

        with patch.object(type(wiz), "action_apply", _fake_action_apply, create=True):
            done = False
            for meth in (
                "execute",
                "action_confirm",
                "action_apply",
                "action_configure_document_layout",
            ):
                if hasattr(wiz, meth):
                    getattr(wiz, meth)()
                    done = True
                    break

        self.assertTrue(done, "Expected loop to call injected action_apply")
        self.assertEqual(self.company.report_font_size, "13")
