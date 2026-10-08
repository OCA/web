# Copyright 2025 ForgeFlow S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from psycopg2.extras import Json

from odoo import models
from odoo.tools import SQL


class Base(models.AbstractModel):
    _inherit = "base"

    def _web_translation_langs(self):
        """Return the language codes a translation dialog should expose.

        These are the installed (active) languages plus ``en_US``, which is
        always the source language even when it is not active.
        """
        langs = [code for code, _name in self.env["res.lang"].get_installed()]
        if "en_US" not in langs:
            langs.insert(0, "en_US")
        return langs

    def web_get_field_translations_full(self, field_name):
        """Return the *whole* field value for each language.

        Unlike :meth:`~odoo.models.Model.get_field_translations`, which for
        ``html`` fields (whose ``translate`` attribute is a callable) splits the
        content into individual source terms, this returns the full value per
        language so it can be edited as a single rich-text block.

        :param str field_name: name of the translatable field.
        :return: list of ``{"lang": code, "value": html}`` dictionaries, one per
            language.
        """
        self.ensure_one()
        self.check_access("read")
        record = self.with_context(check_translations=True, prefetch_langs=True)
        return [
            {"lang": lang, "value": record.with_context(lang=lang)[field_name] or ""}
            for lang in self._web_translation_langs()
        ]

    def web_set_field_translations_full(self, field_name, translations):
        """Write the full value of ``field_name`` for each given language.

        :param str field_name: name of the translatable field.
        :param dict translations: mapping ``{lang: value}`` with the full value
            for each language.

        Each language is stored as an independent full value. We write the
        ``jsonb`` translations column directly (as :meth:`update_field_translations`
        does for ``translate=True`` fields) instead of writing the field per
        language context. The latter would, for model-term translated (``html``)
        fields, re-synchronise terms and overwrite the ``en_US`` source whenever
        a translation no longer shares the source structure.
        """
        self.ensure_one()
        field = self._fields[field_name]
        if not field.translate:
            return False
        self.check_access("write")
        self._check_field_access(field, "write")
        valid_langs = set(self._web_translation_langs())

        # Sanitise every value through the field itself before storing it.
        values = {}
        for lang, value in translations.items():
            if lang not in valid_langs:
                continue
            record_lang = self.with_context(lang=lang)
            values[lang] = field.convert_to_cache(value, record_lang) or None
        if not values:
            return False

        # Keep a meaningful ``en_US`` fallback so the source is never lost.
        fallback = (
            values.get("en_US")
            or self.with_context(lang="en_US")[field_name]
            or next((v for v in values.values() if v is not None), None)
        )
        self.invalidate_recordset([field_name])
        self.env.cr.execute(
            SQL(
                """ UPDATE %(table)s
                    SET %(field)s = NULLIF(
                        jsonb_strip_nulls(
                            %(fallback)s
                            || COALESCE(%(field)s, '{}'::jsonb)
                            || %(value)s
                        ),
                        '{}'::jsonb)
                    WHERE id = %(id)s
                """,
                table=SQL.identifier(self._table),
                field=SQL.identifier(field_name),
                fallback=Json({"en_US": fallback}),
                value=Json(values),
                id=self.id,
            )
        )
        self.modified([field_name])
        return True
