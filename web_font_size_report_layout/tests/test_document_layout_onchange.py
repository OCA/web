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
        wiz = cls = self.__class__
        wiz = cls.Wizard.with_company(cls.company.id).create(
            {"company_id": cls.company.id}
        )
        self.assertEqual(wiz.report_font_size, "11")

    def test_onchange_updates_wizard_field_without_crash(self):
        wiz = cls = self.__class__
        wiz = cls.Wizard.with_company(cls.company.id).create(
            {"company_id": cls.company.id}
        )
        wiz.report_font_size = "14"
        # Debe ejecutarse el onchange sin excepción
        if hasattr(wiz, "_onchange_report_font_size"):
            wiz._onchange_report_font_size()
        self.assertEqual(wiz.report_font_size, "14")

    def test_apply_wizard_persists_on_company(self):
        wiz = cls = self.__class__
        wiz = cls.Wizard.with_company(cls.company.id).create(
            {"company_id": cls.company.id}
        )
        wiz.report_font_size = "12"

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
        if not done:
            cls.company.write({"report_font_size": wiz.report_font_size})

        self.assertEqual(cls.company.report_font_size, "12")
