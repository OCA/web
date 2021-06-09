# Copyright 2021 InitOS Gmbh
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo.tests.common import TransactionCase


class TestWebTranslateDialog(TransactionCase):
    def setUp(self):
        super(TestWebTranslateDialog, self).setUp()
        self.env["res.lang"].load_lang("de_DE")
        self.partner_title = self.env["res.partner.title"].create({"name": "Doctor"})

    def test_language_translations(self):
        translation = self.env["ir.translation"].create(
            {
                "type": "model",
                "name": "res.partner.title,name",
                "lang": "de_DE",
                "res_id": self.partner_title.id,
                "src": "Doctor",
                "value": "Arzt",
                "state": "translated",
            }
        )
        translation_value = translation.read(["value"])
        self.assertEqual(translation_value[0]["value"], "Arzt")

    def test_get_field_translations(self):
        translation_id = self.env["ir.translation"].create(
            {
                "type": "model",
                "name": "res.partner.title,name",
                "lang": "de_DE",
                "res_id": self.partner_title.id,
                "src": "Doctor",
                "value": "Arzt",
                "state": "translated",
            }
        )
        results = self.partner_title.get_field_translations(["name"])
        res = results[translation_id.res_id][translation_id.lang]
        if res:
            self.assertEqual(res.get("name"), "Arzt")
