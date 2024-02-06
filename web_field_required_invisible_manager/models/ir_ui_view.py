# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
import json

from lxml import etree

from odoo import models

from odoo.addons.base.models.ir_ui_view import NameManager


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def postprocess_and_fields(self, node, model=None, validate=False):
        arch, new_fields = super().postprocess_and_fields(node, model, validate)
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
                        if type(z_arch["arch"]) is bytes:
                            z_arch["arch"] = z_arch["arch"].decode("utf-8")
                        name_manager = NameManager(False, self.env[restr.model_name])
                        if restr.readonly_field_id and restr.readonly_model_id:
                            model_field_infos = name_manager.fields_get.get(
                                restr.readonly_field_id.name
                            )
                            z_arch["fields"][
                                restr.readonly_field_id.name
                            ] = model_field_infos
                        if restr.visibility_field_id and restr.invisible_model_id:
                            model_field_infos = name_manager.fields_get.get(
                                restr.visibility_field_id.name
                            )
                            z_arch["fields"][
                                restr.visibility_field_id.name
                            ] = model_field_infos
                        if restr.required_field_id and restr.required_model_id:
                            model_field_infos = name_manager.fields_get.get(
                                restr.required_field_id.name
                            )
                            z_arch["fields"][
                                restr.required_field_id.name
                            ] = model_field_infos
        return arch

    def create_restrictions_fields(self, restrictions, view_type, arch):
        doc = etree.XML(arch)
        for node in doc.xpath("//field"):
            name = node.attrib.get("name")
            restrictions_filtered = restrictions.filtered(
                lambda x: x.field_id.name == name
            )
            if not restrictions_filtered:
                continue
            for r in restrictions_filtered:
                field_node_str = "<field name='%s' invisible='1'/>"
                field_node_mod = bytes(
                    '{"invisible": true,"column_invisible": true}', "utf-8"
                )
                if view_type == "tree":
                    field_node_str = (
                        "<field name='%s' column_invisible='1' optional='hide'/>"
                    )
                if r.field_invisible and r.invisible_model_id:
                    modifiers = json.loads(node.get("modifiers"))
                    visibility_field_name = r.get_field_name("visibility")
                    modifiers["invisible"] = (
                        "[('%s', '=', True)]" % visibility_field_name
                    )
                    node.set("modifiers", json.dumps(modifiers))
                    new_node = etree.fromstring(field_node_str % visibility_field_name)
                    new_node.set("invisible", "1")
                    new_node.set("modifiers", field_node_mod)
                    node.getparent().append(new_node)
                if r.required_field_id and r.required_model_id:
                    modifiers = json.loads(node.get("modifiers"))
                    required_field_name = r.get_field_name("required")
                    modifiers["required"] = "[('%s', '=', True)]" % required_field_name
                    node.set("modifiers", json.dumps(modifiers))
                    new_node = etree.fromstring(field_node_str % required_field_name)
                    new_node.set("invisible", "1")
                    new_node.set("modifiers", field_node_mod)
                    node.getparent().append(new_node)
                if r.readonly_field_id and r.readonly_model_id:
                    modifiers = json.loads(node.get("modifiers"))
                    readonly_field_name = r.get_field_name("readonly")
                    modifiers["readonly"] = "[('%s', '=', True)]" % readonly_field_name
                    node.set("modifiers", json.dumps(modifiers))
                    new_node = etree.fromstring(field_node_str % readonly_field_name)
                    new_node.set("invisible", "1")
                    new_node.set("modifiers", field_node_mod)
                    node.getparent().append(new_node)
            arch = etree.tostring(doc)
        return arch
