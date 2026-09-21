from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestCompanyFontSize(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Company = cls.env["res.company"]

    def test_default_and_selection_values(self):
        co = self.Company.create({"name": "Co A"})
        # Default del módulo: "11"
        self.assertEqual(co.report_font_size, "11")
        # Selección válida
        co.report_font_size = "9"
        self.assertEqual(co.report_font_size, "9")

    def test_create_with_explicit_font_size_persists(self):
        co = self.Company.create({"name": "Co B", "report_font_size": "12"})
        self.assertEqual(co.report_font_size, "12")

    def test_write_only_style_field_is_safe(self):
        co = self.Company.create({"name": "Co C"})
        # Cambiar sólo el tamaño de fuente no debe romper ni requerir otros campos
        co.write({"report_font_size": "14"})
        self.assertEqual(co.report_font_size, "14")

    def test_write_unrelated_fields_dont_affect_font_size(self):
        co = self.Company.create({"name": "Co D"})
        old = co.report_font_size
        co.write({"email": "x@example.com"})
        self.assertEqual(co.report_font_size, old)

    def test_multi_company_independence(self):
        co1 = self.Company.create({"name": "Co E"})
        co2 = self.Company.create({"name": "Co F"})
        co1.write({"report_font_size": "9"})
        co2.write({"report_font_size": "14"})
        self.assertEqual(co1.report_font_size, "9")
        self.assertEqual(co2.report_font_size, "14")
