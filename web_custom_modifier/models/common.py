# © 2023 - today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from typing import List, Mapping


def set_custom_modifiers_on_fields(modifiers: List[dict], fields: Mapping[str, dict]):
    _hide_selection_items(modifiers, fields)


def _hide_selection_items(modifiers, fields):
    hidden_items = (
        m
        for m in modifiers
        if m["type_"] == "field" and m["modifier"] == "selection_hide"
    )
    for item in hidden_items:
        _hide_single_selection_item(item, fields)


def _hide_single_selection_item(modifier, fields):
    field = fields.get(modifier["reference"])
    if field and "selection" in field:
        field["selection"] = [
            (k, v) for k, v in field["selection"] if k != modifier["key"]
        ]
