# Copyright 2026 Cetmix OÜ
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

from odoo.tests import tagged

from odoo.addons.base.tests.common import BaseCommon


@tagged("post_install", "-at_install")
class TestResPartnerUmbriaCityAutocomplete(BaseCommon):
    """In-memory city + ZIP suggestions for the partner City widget."""

    def _cities(self, value):
        rows = self.env["res.partner"].umbria_city_autocomplete(value)
        return [row["city"] for row in rows]

    def test_empty_value_returns_known_cities(self):
        """Blank, whitespace, or None input returns the full demo sample."""
        all_cities = self._cities("")
        self.assertIn("Perugia", all_cities)
        self.assertIn("Assisi", all_cities)
        self.assertIn("Terni", all_cities)
        self.assertIn("Roma", all_cities)
        self.assertIn("Paris", all_cities)
        self.assertGreater(len(all_cities), 10)
        self.assertEqual(self._cities("   "), all_cities)
        self.assertEqual(self._cities(None), all_cities)

    def test_filters_case_insensitive_substring(self):
        """The needle is stripped and matched case-insensitively."""
        all_cities = self._cities("")

        def expected(needle):
            return [name for name in all_cities if needle in name.lower()]

        self.assertEqual(self._cities("  PER  "), expected("per"))
        self.assertEqual(self._cities("ass"), expected("ass"))
        self.assertEqual(self._cities("città"), expected("città"))

    def test_no_match_returns_empty_list(self):
        """Unknown input yields no rows."""
        self.assertEqual(self._cities("xyzzy"), [])

    def test_rows_contain_city_and_zip(self):
        """Each row carries City and ZIP so select fills both fields."""
        rows = self.env["res.partner"].umbria_city_autocomplete("Todi")
        self.assertEqual(rows, [{"city": "Todi", "zip": "06059"}])
        roma = self.env["res.partner"].umbria_city_autocomplete("Roma")
        self.assertEqual(roma, [{"city": "Roma", "zip": "00184"}])
