# Copyright 2026 TechnoLibre (https://technolibre.ca)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import logging
import unicodedata

from odoo import fields, models

_logger = logging.getLogger(__name__)


def _sort_key(name):
    """Case- and accent-insensitive sort key (NFD + casefold).

    Examples: 'É' → 'e', 'ñ' → 'n', 'Z' → 'z'
    Thread-safe, multilingual, no dependency on the system locale.
    """
    normalized = unicodedata.normalize("NFD", name or "")
    stripped = "".join(
        c for c in normalized if unicodedata.category(c) != "Mn"
    )
    return stripped.casefold()


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    menu_reorder_lang_to_order = fields.Char(
        string="Lang name",
        help="Language used to read menu labels when sorting. "
        "Defaults to the company language.",
        default=lambda self: self.env.company.partner_id.lang,
        config_parameter="menu_reorder_settings.menu_reorder_lang_to_order",
    )

    menu_reorder_algorithm_lang_to_order = fields.Selection(
        string="Algorithm to choose when compute reorder",
        selection=[
            ("by_sequence", "By sequence"),
            ("by_alphabetical", "By Alphabetical order"),
            ("by_label", "By custom label"),
        ],
        default="by_sequence",
        required=True,
        config_parameter="menu_reorder_settings.menu_reorder_algorithm_lang_to_order",
    )

    menu_order_labels = fields.Text(
        string="Menu Order Labels",
        help="Enter menu labels in the target language, one per line.",
    )

    def get_values(self):
        res = super().get_values()
        res["menu_order_labels"] = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("menu_reorder_settings.menu_order_labels", default="")
        )
        return res

    def set_values(self):
        super().set_values()
        self.env["ir.config_parameter"].sudo().set_param(
            "menu_reorder_settings.menu_order_labels",
            self.menu_order_labels or "",
        )

    def execute_menu_reorder(self):
        lang = (
            self.menu_reorder_lang_to_order or self.env.company.partner_id.lang
        )
        menu_ids = (
            self.env["ir.ui.menu"]
            .sudo()
            .with_context(lang=lang)
            .search([("parent_id", "=", False)])
        )

        if self.menu_reorder_algorithm_lang_to_order == "by_sequence":
            lst_menu = sorted(menu_ids, key=lambda m: m.sequence)
            for idx, menu_id in enumerate(lst_menu):
                menu_id.sequence = (idx + 1) * 10

        elif self.menu_reorder_algorithm_lang_to_order == "by_alphabetical":
            lst_menu = sorted(
                menu_ids,
                key=lambda m: _sort_key(m.display_name),
            )
            for idx, menu_id in enumerate(lst_menu):
                menu_id.sequence = (idx + 1) * 10

        elif self.menu_reorder_algorithm_lang_to_order == "by_label":
            if not self.menu_order_labels:
                return
            menu_labels = [
                label.strip()
                for label in self.menu_order_labels.split("\n")
                if label.strip()
            ]

            lst_menu_id_reorder = []
            sequence = 10
            for idx_i, label in enumerate(menu_labels):
                sequence = (idx_i + 1) * 10
                lst_menu = [m for m in menu_ids if label == m.display_name]
                for menu_id in lst_menu:
                    menu_id.sequence = sequence
                    lst_menu_id_reorder.append(menu_id)

            # Unlisted menus are sorted alphabetically at the end,
            # case- and accent-insensitive.
            last_sequence = sequence + 10
            lst_menu = sorted(
                [m for m in menu_ids if m not in lst_menu_id_reorder],
                key=lambda m: _sort_key(m.display_name),
            )
            for idx, menu_id in enumerate(lst_menu):
                menu_id.sequence = last_sequence + idx * 10

        _logger.info(
            "End of reorder menu from algorithm %s (lang: %s)",
            self.menu_reorder_algorithm_lang_to_order,
            lang,
        )
