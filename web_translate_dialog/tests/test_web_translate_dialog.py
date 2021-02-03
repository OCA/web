# Copyright 2021 InitOS Gmbh
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo.tests.common import TransactionCase


class TestWebTranslateDialog(TransactionCase):
    def setUp(self):
        super(TestWebTranslateDialog, self).setUp()
        self.product = self.env["product.template"].create({"name": "English Name"})

    def test_language_translations(self):
        self.env["res.lang"].load_lang("de_DE")
        translation = self.env["ir.translation"].create(
            {
                "type": "model",
                "name": "product.template,name",
                "lang": "de_DE",
                "res_id": self.product.id,
                "src": "English Name",
                "value": "Translated Name",
                "state": "translated",
            }
        )
        translation_value = translation.read(["value"])
        self.assertEqual(translation_value[0]["value"], "Translated Name")

    def test_language_translations_01(self):
        self.env["res.lang"].load_lang("de_DE")
        translation = self.env["ir.translation"].create(
            {
                "type": "model",
                "name": "product.template,name",
                "lang": "de_DE",
                "res_id": self.product.id,
                "src": "English Name",
                "value": "Translated Name",
                "state": "translated",
            }
        )
        translation_value = translation.read(["value"])
        self.assertNotEqual(translation_value[0]["value"], "German Name")
