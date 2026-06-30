# Copyright 2025 ForgeFlow S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import Form, TransactionCase


class TestHtmlFieldTranslation(TransactionCase):
    """Exercise the per-language full-value translation helpers on a
    translatable HTML field that is shown in a form view.

    A small custom model with a translatable ``html`` field (which becomes a
    ``html_translate`` callable field, i.e. exactly the kind whose standard
    dialog splits the content into terms) and its own form view are created so
    the behaviour can be reproduced through a :class:`~odoo.tests.Form`.
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env["res.lang"]._activate_lang("fr_FR")
        model = cls.env["ir.model"].create(
            {"name": "HTML Translate Test", "model": "x_html_translate_test"}
        )
        cls.env["ir.model.fields"].create(
            {
                "name": "x_body",
                "field_description": "Body",
                "model_id": model.id,
                "ttype": "html",
                "translate": True,
            }
        )
        cls.view = cls.env["ir.ui.view"].create(
            {
                "name": "x_html_translate_test.form",
                "model": "x_html_translate_test",
                "type": "form",
                "arch": """
                    <form>
                        <field name="x_body" widget="html"/>
                    </form>
                """,
            }
        )
        cls.TestModel = cls.env["x_html_translate_test"]
        # Set the source (en_US) value the way a user would: through a Form.
        with Form(cls.TestModel.with_context(lang="en_US"), view=cls.view) as form:
            form.x_body = "<p>Hello world</p>"
        cls.record = form.record

    def test_get_field_translations_full_returns_value_per_language(self):
        result = self.record.web_get_field_translations_full("x_body")
        by_lang = {term["lang"]: term["value"] for term in result}
        # Both the source language and the activated language are present.
        self.assertIn("en_US", by_lang)
        self.assertIn("fr_FR", by_lang)
        # The full value is returned, not chunked source terms.
        self.assertIn("Hello world", by_lang["en_US"])
        # Without a translation yet, the field falls back to the source value.
        self.assertIn("Hello world", by_lang["fr_FR"])

    def test_set_field_translations_full_writes_each_language(self):
        self.record.web_set_field_translations_full(
            "x_body",
            {
                "en_US": "<p>Hello world</p>",
                "fr_FR": "<p>Bonjour le monde</p>",
            },
        )
        record_en = self.record.with_context(lang="en_US")
        record_fr = self.record.with_context(lang="fr_FR")
        self.assertIn("Hello world", record_en.x_body)
        self.assertIn("Bonjour le monde", record_fr.x_body)
        # Each language keeps its own full value; the source is not corrupted by
        # a structurally different translation.
        self.assertNotIn("Bonjour", record_en.x_body)
        self.assertNotIn("Hello", record_fr.x_body)

    def test_set_field_translations_full_ignores_non_translatable(self):
        # ``display_name`` is not translatable here: the method must be a no-op
        # returning False rather than writing garbage.
        result = self.record.web_set_field_translations_full("x_name", {"fr_FR": "Nom"})
        self.assertFalse(result)
