# Copyright 2026 Cetmix OÜ
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

from odoo import api, models

# Demo (city, zip) pairs for the partner City autocomplete (not official).
# Italy first (Umbria + other well-known cities), then a few world cities.
_DEMO_CITIES = (
    # Umbria
    ("Amelia", "05022"),
    ("Assisi", "06081"),
    ("Bastia Umbra", "06083"),
    ("Bevagna", "06031"),
    ("Castiglione del Lago", "06061"),
    ("Città della Pieve", "06062"),
    ("Città di Castello", "06012"),
    ("Corciano", "06073"),
    ("Deruta", "06053"),
    ("Foligno", "06034"),
    ("Gualdo Tadino", "06023"),
    ("Gubbio", "06024"),
    ("Magione", "06063"),
    ("Marsciano", "06055"),
    ("Montefalco", "06036"),
    ("Narni", "05035"),
    ("Nocera Umbra", "06025"),
    ("Norcia", "06046"),
    ("Orvieto", "05018"),
    ("Passignano sul Trasimeno", "06065"),
    ("Perugia", "06121"),
    ("San Gemini", "05029"),
    ("Spello", "06038"),
    ("Spoleto", "06049"),
    ("Terni", "05100"),
    ("Todi", "06059"),
    ("Trevi", "06039"),
    ("Umbertide", "06019"),
    # Other Italy
    ("Bari", "70121"),
    ("Bologna", "40121"),
    ("Catania", "95121"),
    ("Firenze", "50122"),
    ("Genova", "16121"),
    ("Milano", "20121"),
    ("Napoli", "80133"),
    ("Padova", "35121"),
    ("Palermo", "90133"),
    ("Pisa", "56126"),
    ("Roma", "00184"),
    ("Siena", "53100"),
    ("Torino", "10121"),
    ("Venezia", "30124"),
    ("Verona", "37121"),
    # World
    ("Amsterdam", "1012 AB"),
    ("Athens", "10557"),
    ("Barcelona", "08002"),
    ("Beijing", "100000"),
    ("Berlin", "10115"),
    ("Brussels", "1000"),
    ("Buenos Aires", "C1002"),
    ("Cairo", "11511"),
    ("Chicago", "60601"),
    ("Dubai", "00000"),
    ("Dublin", "D02 AF30"),
    ("Hong Kong", "999077"),
    ("Istanbul", "34122"),
    ("Lisbon", "1100-148"),
    ("London", "SW1A 1AA"),
    ("Los Angeles", "90012"),
    ("Madrid", "28013"),
    ("Mexico City", "06000"),
    ("New York", "10001"),
    ("Paris", "75001"),
    ("Prague", "11000"),
    ("Rio de Janeiro", "20040-020"),
    ("San Francisco", "94102"),
    ("Seoul", "04524"),
    ("Singapore", "018956"),
    ("Stockholm", "111 57"),
    ("Sydney", "2000"),
    ("Tokyo", "100-0001"),
    ("Toronto", "M5H 2N2"),
    ("Vienna", "1010"),
    ("Zurich", "8001"),
)


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def umbria_city_autocomplete(self, value):
        """Return city rows (with ZIP) matching the typed City input.

        Selecting a suggestion writes ``city`` and ``zip`` on the partner.
        ZIP values are demo data and may be approximate or fake.

        :param str value: current Char input (trimmed by the widget)
        :return: list of dicts with ``city`` and ``zip`` keys
        :rtype: list[dict]
        """
        needle = (value or "").strip().lower()
        rows = (
            _DEMO_CITIES
            if not needle
            else tuple(
                (name, zipcode)
                for name, zipcode in _DEMO_CITIES
                if needle in name.lower()
            )
        )
        return [{"city": name, "zip": zipcode} for name, zipcode in rows]
