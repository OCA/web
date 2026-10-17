# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

import ast

from lxml import etree

from odoo import models
from odoo.osv.expression import distribute_not, normalize_domain

from odoo.addons.base.models.ir_ui_view import NameManager


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def postprocess_and_fields(self, node, model=None, validate=False, **options):
        arch, new_fields = super().postprocess_and_fields(
            node, model, validate=validate, **options
        )
        if self.type not in ["form", "tree"] and node.tag not in ["form", "tree"]:
            return arch, new_fields
        restrictions = self.env["custom.field.restriction"].search(
            [
                ("model_name", "=", model or self.model),
                ("group_ids", "in", self.env.user.groups_id.ids),
            ]
        )
        view_type = node.tag or self.type
        if restrictions:
            arch = self.create_restrictions_fields(restrictions, view_type, arch)
        arch = self.process_child_fields(arch, new_fields, view_type)
        return arch, new_fields

    def process_child_fields(self, arch, new_fields, view_type):
        """Collect all relational fields and update their views"""
        view_model = self.env["ir.model"]._get(self.model)
        related_fields = [
            (k.name, k.relation)
            for k in view_model.field_id
            if k.ttype in ["many2many", "many2one", "one2many"]
        ]
        related_models_names = [r[1] for r in related_fields]
        restrictions = self.env["custom.field.restriction"].search(
            [
                ("model_name", "in", related_models_names),
                ("group_ids", "in", self.env.user.groups_id.ids),
            ]
        )
        if restrictions and view_type == "form":
            for restr in restrictions:
                todo_fields = list(
                    filter(lambda x: x[1] == restr.model_name, related_fields)
                )
                for todo_field in todo_fields:
                    if not new_fields.get(todo_field[0]):
                        continue
                    for sub_view_type, sub_view in new_fields[todo_field[0]][
                        "views"
                    ].items():
                        if sub_view_type not in ["form", "tree"]:
                            continue
                        z_arch = sub_view
                        z_arch["arch"] = self.create_restrictions_fields(
                            restr, view_type, z_arch["arch"]
                        )
                        if isinstance(z_arch["arch"], bytes):
                            z_arch["arch"] = z_arch["arch"].decode("utf-8")
                        name_manager = NameManager(False, self.env[restr.model_name])
                        if restr.readonly_field_id and restr.readonly_model_id:
                            model_field_infos = name_manager.fields_get.get(
                                restr.readonly_field_id.name
                            )
                            z_arch["fields"][restr.readonly_field_id.name] = (
                                model_field_infos
                            )
                        if restr.visibility_field_id and restr.invisible_model_id:
                            model_field_infos = name_manager.fields_get.get(
                                restr.visibility_field_id.name
                            )
                            z_arch["fields"][restr.visibility_field_id.name] = (
                                model_field_infos
                            )
                        if restr.required_field_id and restr.required_model_id:
                            model_field_infos = name_manager.fields_get.get(
                                restr.required_field_id.name
                            )
                            z_arch["fields"][restr.required_field_id.name] = (
                                model_field_infos
                            )
        return arch

    def create_restrictions_fields(self, restrictions, view_type, arch):
        doc = etree.XML(arch)
        for node in doc.xpath("//field"):
            field_name = node.attrib.get("name")
            restrictions_filtered = restrictions.filtered(
                lambda r, field_name=field_name: r.field_id.name == field_name
            )
            if not restrictions_filtered:
                continue

            for r in restrictions_filtered:
                domain = (
                    (
                        ast.literal_eval(r.condition_domain)
                        if isinstance(r.condition_domain, str)
                        else r.condition_domain
                    )
                    if r.condition_domain
                    else []
                )

                if r.field_invisible and r.invisible_model_id:
                    node.set(
                        "invisible",
                        self.domain_to_expression(domain)
                        or r.get_field_name("visibility"),
                    )
                if r.required_field_id and r.required_model_id:
                    node.set(
                        "required",
                        self.domain_to_expression(domain)
                        or r.get_field_name("required"),
                    )
                if r.readonly_field_id and r.readonly_model_id:
                    node.set(
                        "readonly",
                        self.domain_to_expression(domain)
                        or r.get_field_name("readonly"),
                    )

        return etree.tostring(doc, encoding="unicode")

    @staticmethod
    def domain_to_expression(domain):
        """Convert the given domain into a python expression"""
        domain = normalize_domain(domain)
        domain = distribute_not(domain)
        expression = []
        for leaf in reversed(domain):
            if leaf == "&":
                right = expression.pop()
                left = expression.pop()
                expression.append(f"({left} and {right})")
            elif leaf == "|":
                right = expression.pop()
                left = expression.pop()
                expression.append(f"({left} or {right})")
            elif leaf == "!":
                expr = expression.pop()
                expression.append(f"(not {expr})")
            elif isinstance(leaf, tuple | list):
                left, operator, right = leaf
                if operator == "=":
                    operator = "=="
                elif operator == "<>":
                    operator = "!="
                if operator in ["in", "not in"] and not isinstance(right, list | tuple):
                    right = [right]
                if operator == "in":
                    expr = f"{right!r} in {left}"
                elif operator == "not in":
                    expr = f"{right!r} not in {left}"
                else:
                    expr = f"{left} {operator} {right!r}"
                expression.append(expr)
            else:
                expression.append(str(leaf))
        return " ".join(expression)
