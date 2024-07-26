# Copyright 2023 - today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from typing import List, Mapping


def set_custom_labels_on_fields(labels: List[dict], fields: Mapping[str, dict]):
    """Set the custom labels on the related fields.

    :param labels: a list of custom labels to apply.
    :param fields: the dict of fields data to extend.
    """
    _set_custom_field_names(labels, fields)
    _set_custom_field_helpers(labels, fields)
    _set_custom_selection_labels(labels, fields)


def _set_custom_field_names(labels, fields):
    field_labels = _iter_field_labels_with_position(labels, "string")
    for label in field_labels:
        _set_single_custom_field_name(label, fields)


def _set_single_custom_field_name(label, fields):
    field = fields.get(label["reference"])
    if field:
        field["string"] = label["term"]


def _set_custom_field_helpers(labels, fields):
    field_helps = _iter_field_labels_with_position(labels, "help")
    for label in field_helps:
        _set_single_custom_field_helper(label, fields)


def _set_single_custom_field_helper(label, fields):
    field = fields.get(label["reference"])
    if field:
        field["help"] = label["term"]


def _iter_field_labels_with_position(labels, position):
    return (
        label
        for label in labels
        if label["type_"] == "field" and label["position"] == position
    )


def _set_custom_selection_labels(labels, fields):
    selection_labels = (
        label
        for label in labels
        if label["type_"] == "field" and label["position"] == "selection"
    )
    for label in selection_labels:
        _set_single_custom_selection_label(label, fields)


def _set_single_custom_selection_label(label, fields):
    field = fields.get(label["reference"])
    if field and "selection" in field:
        field["selection"] = [
            (k, label["term"] if k == label["key"] else v)
            for k, v in field["selection"]
        ]
