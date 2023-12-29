# Copyright 2023 - today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import json

STANDARD_MODIFIERS = (
    "invisible",
    "column_invisible",
    "readonly",
    "required",
)


def set_custom_modifiers_on_fields(modifiers, fields):
    """
    :param modifiers: list[dict] of modifiers to apply on the fields
    :param fields:  dict[str, dict]  of model's fields and their attributes.
    :return:
    """
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


def add_custom_modifiers_to_view_arch(modifiers, arch):
    """Add custom modifiers to the given view architecture."""
    for modifier in modifiers:
        _add_custom_modifier_to_view_tree(modifier, arch)
    return arch


def _add_custom_modifier_to_view_tree(modifier, tree):
    """Add a custom modifier to the given view architecture."""
    xpath_expr = modifier["reference"]
    if modifier["type_"] == "field":
        xpath_expr = (
            "//field[@name='{field_name}'] | //modifier[@for='{field_name}']".format(
                field_name=modifier["reference"]
            )
        )
    for node in tree.xpath(xpath_expr):
        _add_custom_modifier_to_node(node, modifier)


def _add_custom_modifier_to_node(node, modifier):
    key = modifier["modifier"]
    if key == "widget":
        node.attrib["widget"] = modifier["key"]

    if key == "optional":
        node.attrib["optional"] = modifier["key"]

    elif key == "force_save":
        node.attrib["force_save"] = "1"

    elif key == "limit":
        node.attrib["limit"] = modifier["key"]

    elif key in STANDARD_MODIFIERS:
        node.set(key, "1")
        modifiers = _get_node_modifiers(node)
        modifiers[key] = True
        _set_node_modifiers(modifiers, node)


def _get_node_modifiers(node):
    modifiers = node.get("modifiers")
    return json.loads(modifiers) if modifiers else {}


def _set_node_modifiers(modifiers, node):
    node.set("modifiers", json.dumps(modifiers))
