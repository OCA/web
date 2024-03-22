# Copyright 2023 - today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from lxml import etree

from odoo import models

from .common import set_custom_labels_on_fields


class ViewWithCustomLabels(models.Model):

    _inherit = "ir.ui.view"

    def _postprocess_view(self, node, model, validate=True, editable=True):
        arch, name_manager = super()._postprocess_view(
            node, model, validate=validate, editable=editable
        )
        lang = self.env.context.get("lang") or self.env.user.lang
        labels = self.env["web.custom.label"].get(model, lang)

        arch_with_custom_labels = _add_custom_labels_to_view_arch(labels, arch)
        set_custom_labels_on_fields(labels, name_manager.available_fields)
        return arch_with_custom_labels, name_manager


def _add_custom_labels_to_view_arch(labels, arch):
    labels_to_apply = [
        label
        for label in labels
        if label["position"] in ("string", "placeholder", "help")
    ]

    if not labels_to_apply:
        return arch

    tree = etree.fromstring(arch)

    for label in labels_to_apply:
        _add_custom_label_to_view_tree(label, tree)

    return etree.tostring(tree)


def _add_custom_label_to_view_tree(label, tree):
    xpath_expr = (
        "//field[@name='{field_name}'] | //label[@for='{field_name}']".format(
            field_name=label["reference"]
        )
        if label["type_"] == "field"
        else label["reference"]
    )

    for element in tree.xpath(xpath_expr):
        element.attrib[label["position"]] = label["term"]
