# Copyright 2023 ooops404
# Copyright 2025 Simone Rubino - PyTech
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
import json

from lxml import etree

from odoo import models

RESTRICTION_MODIFIERS = [
    # (restriction type, modifier set on the restricted field)
    ("visibility", "invisible"),
    ("required", "required"),
    ("readonly", "readonly"),
]


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def postprocess_and_fields(self, node, model=None, **options):
        arch, models_fields = super().postprocess_and_fields(node, model, **options)
        if self.type not in ["form", "tree"] and node.tag not in ["form", "tree"]:
            return arch, models_fields
        doc = etree.fromstring(arch)
        self._apply_field_restrictions(doc, model or self.model, models_fields)
        arch = etree.tostring(doc, encoding="unicode")
        return arch, models_fields

    def _apply_field_restrictions(self, node, model_name, models_fields):
        """Add the restriction fields to ``node`` and to its embedded subviews.

        ``node`` is the postprocessed architecture of a view of ``model_name``.
        ``models_fields`` maps every model used in the architecture to the
        fields the web client has to load, so the fields added here have to be
        declared in it too.
        """
        if not model_name or model_name not in self.env:
            return
        field_nodes = list(self._iter_view_field_nodes(node))
        if node.tag in ["form", "tree"]:
            restrictions = self._get_model_restrictions(model_name)
            if restrictions:
                self.create_restrictions_fields(
                    restrictions, node.tag, field_nodes, model_name, models_fields
                )
        # Relational fields embed the subview of their comodel in the same
        # architecture, each subview is restricted by its own model
        model = self.env[model_name]
        for field_node in field_nodes:
            field = model._fields.get(field_node.get("name"))
            if not field or not field.relational:
                continue
            for subview_node in field_node:
                if subview_node.tag in ["form", "tree"]:
                    self._apply_field_restrictions(
                        subview_node, field.comodel_name, models_fields
                    )

    def _iter_view_field_nodes(self, node):
        """Yield the field nodes of ``node``, without descending into subviews."""
        for child in node:
            if child.tag == "field":
                yield child
            else:
                yield from self._iter_view_field_nodes(child)

    def _get_model_restrictions(self, model_name):
        """Return the restrictions of ``model_name`` applying to current user."""
        restriction_model = self.env["custom.field.restriction"]
        restrictions_ids = restriction_model._get_ids_by_model(model_name)
        if not restrictions_ids:
            return restriction_model.browse()
        return restriction_model.search(
            [
                ("id", "in", restrictions_ids),
                ("group_ids", "in", self.env.user.groups_id.ids),
            ]
        )

    def create_restrictions_fields(
        self, restrictions, view_type, field_nodes, model_name, models_fields
    ):
        """Set the modifiers of the restricted fields in ``field_nodes``.

        The technical field each modifier depends on is added to the view next
        to the restricted field.
        """
        for node in field_nodes:
            name = node.attrib.get("name")
            restrictions_filtered = restrictions.filtered(
                lambda x: x.field_id.name == name
            )
            for restriction in restrictions_filtered:
                for f_type, modifier in RESTRICTION_MODIFIERS:
                    if not self._is_restriction_applied(restriction, f_type):
                        continue
                    self._add_restriction_field(
                        node,
                        restriction,
                        f_type,
                        modifier,
                        view_type,
                        model_name,
                        models_fields,
                    )

    def _is_restriction_applied(self, restriction, f_type):
        if f_type == "visibility":
            return restriction.field_invisible and restriction.invisible_model_id
        if f_type == "required":
            return restriction.required_field_id and restriction.required_model_id
        return restriction.readonly_field_id and restriction.readonly_model_id

    def _add_restriction_field(
        self, node, restriction, f_type, modifier, view_type, model_name, models_fields
    ):
        """Make ``modifier`` of ``node`` depend on the restriction field."""
        field_name = restriction.get_field_name(f_type)
        modifiers = json.loads(node.get("modifiers") or "{}")
        modifiers[modifier] = [(field_name, "=", True)]
        node.set("modifiers", json.dumps(modifiers))
        node.getparent().append(self._get_restriction_field_node(field_name, view_type))
        # The web client only loads the fields declared in the view's models
        models_fields.setdefault(model_name, set()).add(field_name)

    def _get_restriction_field_node(self, field_name, view_type):
        """Return the node of the hidden technical field ``field_name``."""
        new_node = etree.Element("field", {"name": field_name, "invisible": "1"})
        new_modifiers = {"invisible": True}
        if view_type == "tree":
            new_node.set("column_invisible", "1")
            new_node.set("optional", "hide")
            new_modifiers["column_invisible"] = True
        new_node.set("modifiers", json.dumps(new_modifiers))
        return new_node
