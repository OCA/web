# Copyright 2021 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import itertools
import operator

from odoo import api, models


class IrTranslation(models.Model):
    _inherit = "ir.translation"

    @api.model
    def get_translations_for_webclient(self, mods, lang):
        """This is a cloned method from Odoo core.
        Only change the 'order' to ensure get the same hash all times"""
        if not mods:
            mods = [
                x["name"]
                for x in self.env["ir.module.module"]
                .sudo()
                .search_read([("state", "=", "installed")], ["name"])
            ]
        if not lang:
            lang = self._context["lang"]
        langs = self.env["res.lang"]._lang_get(lang)
        lang_params = None
        if langs:
            lang_params = {
                "name": langs.name,
                "direction": langs.direction,
                "date_format": langs.date_format,
                "time_format": langs.time_format,
                "grouping": langs.grouping,
                "decimal_point": langs.decimal_point,
                "thousands_sep": langs.thousands_sep,
                "week_start": langs.week_start,
            }
            lang_params["week_start"] = int(lang_params["week_start"])
            lang_params["code"] = lang

        # Regional languages (ll_CC) must inherit/override their parent
        # lang (ll), but this is done server-side when the language is
        # loaded, so we only need to load the user's lang.
        translations_per_module = {}
        messages = (
            self.env["ir.translation"]
            .sudo()
            .search_read(
                [
                    ("module", "in", mods),
                    ("lang", "=", lang),
                    ("comments", "like", "openerp-web"),
                    ("value", "!=", False),
                    ("value", "!=", ""),
                ],
                ["module", "src", "value"],
                order="module, id",
            )
        )
        for mod, msg_group in itertools.groupby(
            messages, key=operator.itemgetter("module")
        ):
            translations_per_module.setdefault(mod, {"messages": []})
            translations_per_module[mod]["messages"].extend(
                {"id": m["src"], "string": m["value"]} for m in msg_group
            )
        return translations_per_module, lang_params
