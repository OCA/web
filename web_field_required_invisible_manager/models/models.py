# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
import json as simplejson

from lxml import etree

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval

from odoo.addons.base.models.ir_ui_view import NameManager


class IrModel(models.Model):
    _inherit = "ir.model"

    custom_required_restriction_ids = fields.One2many(
        "custom.field.restriction",
        "required_model_id",
    )
    custom_invisible_restriction_ids = fields.One2many(
        "custom.field.restriction",
        "invisible_model_id",
    )
    custom_readonly_restriction_ids = fields.One2many(
        "custom.field.restriction",
        "readonly_model_id",
    )


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def fields_view_get(
        self, view_id=None, view_type=False, toolbar=False, submenu=False
    ):
        arch = super().fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
        )
        if view_type not in ["form", "tree"]:
            return arch
        # TODO speed up somehow
        restrictions = self.env["custom.field.restriction"].search(
            [
                ("model_name", "=", self._name),
                ("group_ids", "in", self.env.user.groups_id.ids),
            ]
        )
        if restrictions:
            arch = self.create_restrictions_fields(restrictions, view_type, arch)
        arch = self.process_child_fields(arch, view_type)
        return arch

    def process_child_fields(self, arch, view_type):
        """Collect all relational fields and update their views"""
        related_fields = [
            (k, v.comodel_name) for k, v in self._fields.items() if v.comodel_name
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
                    if not arch["fields"].get(todo_field[0]):
                        continue
                    for sub_view_type, sub_view in arch["fields"][todo_field[0]][
                        "views"
                    ].items():
                        if sub_view_type not in ["form", "tree"]:
                            continue
                        z_arch = sub_view
                        z_arch = self.create_restrictions_fields(
                            restr, view_type, z_arch
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
        doc = etree.XML(arch["arch"])
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
                    modifiers = simplejson.loads(node.get("modifiers"))
                    visibility_field_name = r.get_field_name("visibility")
                    modifiers["invisible"] = (
                        "[('%s', '=', True)]" % visibility_field_name
                    )
                    node.set("modifiers", simplejson.dumps(modifiers))
                    new_node = etree.fromstring(field_node_str % visibility_field_name)
                    new_node.set("invisible", "1")
                    new_node.set("modifiers", field_node_mod)
                    node.getparent().append(new_node)
                if r.required_field_id and r.required_model_id:
                    modifiers = simplejson.loads(node.get("modifiers"))
                    required_field_name = r.get_field_name("required")
                    modifiers["required"] = "[('%s', '=', True)]" % required_field_name
                    node.set("modifiers", simplejson.dumps(modifiers))
                    new_node = etree.fromstring(field_node_str % required_field_name)
                    new_node.set("invisible", "1")
                    new_node.set("modifiers", field_node_mod)
                    node.getparent().append(new_node)
                if r.readonly_field_id and r.readonly_model_id:
                    modifiers = simplejson.loads(node.get("modifiers"))
                    readonly_field_name = r.get_field_name("readonly")
                    modifiers["readonly"] = "[('%s', '=', True)]" % readonly_field_name
                    node.set("modifiers", simplejson.dumps(modifiers))
                    new_node = etree.fromstring(field_node_str % readonly_field_name)
                    new_node.set("invisible", "1")
                    new_node.set("modifiers", field_node_mod)
                    node.getparent().append(new_node)
            arch["arch"] = etree.tostring(doc)
        return arch

    def _compute_restrictions_fields(self):
        """Common compute method for all restrictions types"""
        for record in self:
            restrictions = self.env["custom.field.restriction"].search(
                [("model_name", "=", self._name)]
            )
            if not restrictions:
                return
            for r in restrictions:
                if r.visibility_field_id:
                    field_name = r.visibility_field_id.name
                    record[field_name] = False
                if r.required_field_id:
                    field_name = r.required_field_id.name
                    record[field_name] = False
                if r.readonly_field_id:
                    field_name = r.readonly_field_id.name
                    record[field_name] = False
                if r.condition_domain:
                    filtered_rec_id = record.filtered_domain(
                        safe_eval(r.condition_domain)
                    )
                    if filtered_rec_id and r.group_ids & self.env.user.groups_id:
                        record[field_name] = True
                elif r.group_ids:
                    if r.group_ids & self.env.user.groups_id:
                        record[field_name] = True

    def default_get(self, fields_list):
        res = super(Base, self).default_get(fields_list)
        if self.env.user.has_group("base.group_user"):
            vals = self._default_get_compute_restrictions_fields()
            if vals:
                res.update(vals)
        return res

    def _default_get_compute_restrictions_fields(self):
        restrictions = self.env["custom.field.restriction"].search(
            [("model_name", "=", self._name)]
        )
        values = {}
        if not restrictions:
            return values
        for r in restrictions:
            if r.visibility_field_id:
                field_name = r.visibility_field_id.name
                values[field_name] = False
            if r.required_field_id:
                field_name = r.required_field_id.name
                values[field_name] = False
            if r.readonly_field_id:
                field_name = r.readonly_field_id.name
                values[field_name] = False
            if r.group_ids:
                if r.group_ids & self.env.user.groups_id:
                    values[field_name] = True
        return values
