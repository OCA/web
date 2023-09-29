# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
import json

from lxml import etree

from odoo import api, models
from odoo.osv import expression
from odoo.tools.safe_eval import safe_eval


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def fields_view_get(
        self, view_id=None, view_type=False, toolbar=False, submenu=False
    ):
        arch = super().fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
        )
        if view_type not in ["form"]:
            return arch
        if self.env.user.has_group("base.group_user"):
            restrictions = self.env["model.button.rule"].search(
                [
                    ("model_name", "=", self._name),
                    ("group_ids", "in", self.env.user.groups_id.ids),
                    ("action", "=", "hide"),
                ]
            )
            if restrictions:
                return self.create_hide_button_field(restrictions, arch)
        return arch

    def create_hide_button_field(self, restrictions, arch):
        """Create a computed field which will be used in attrs of button to hide it"""
        doc = etree.XML(arch["arch"])
        for r in restrictions:
            for node in doc.xpath("//button[@name='%s']" % r.button_name):
                field_node_str = "<field name='%s' invisible='1' />"
                field_node_mod = bytes(
                    '{"invisible": true,"column_invisible": true}', "utf-8"
                )
                modifiers = json.loads(node.get("modifiers", "{}"))
                visibility_field_name = r.get_button_field_name()
                if (
                    modifiers
                    and modifiers.get("invisible")
                    and type(modifiers["invisible"]) == list
                ):
                    norm_dom = expression.normalize_domain(modifiers["invisible"])
                    modifiers["invisible"] = expression.OR(
                        [norm_dom, [(visibility_field_name, "=", True)]]
                    )
                else:
                    modifiers["invisible"] = [(visibility_field_name, "=", True)]
                node.set("modifiers", json.dumps(modifiers))
                new_node = etree.fromstring(field_node_str % visibility_field_name)
                new_node.set("invisible", "1")
                new_node.set("modifiers", field_node_mod)
                node.getparent().append(new_node)
        arch["arch"] = etree.tostring(doc)
        return arch

    def _compute_hide_button(self):
        """Compute if button needs to be hidden"""
        restrictions = self.env["model.button.rule"].search(
            [("model_name", "=", self._name)]
        )
        for record in self:
            for r in restrictions:
                if r.button_visibility_field_id:
                    field_name = r.button_visibility_field_id.name
                    record[field_name] = False
                if r.condition_domain:
                    filtered_rec_id = record.filtered_domain(
                        safe_eval(r.condition_domain)
                    )
                    if filtered_rec_id and r.group_ids & self.env.user.groups_id:
                        record[field_name] = True
                elif r.group_ids and r.group_ids & self.env.user.groups_id:
                    record[field_name] = True

    def default_get(self, fields_list):
        res = super(Base, self).default_get(fields_list)
        if self.env.user.has_group("base.group_user"):
            vals = self._default_get_compute_hide_button_fields()
            if vals:
                res.update(vals)
        return res

    def _default_get_compute_hide_button_fields(self):
        """Required to hide button at the moment of new record creation"""
        restrictions = self.env["model.button.rule"].search(
            [("model_name", "=", self._name)]
        )
        values = {}
        if not restrictions:
            return values
        for r in restrictions:
            if r.button_visibility_field_id:
                field_name = r.button_visibility_field_id.name
                values[field_name] = False
            if r.group_ids and r.group_ids & self.env.user.groups_id:
                values[field_name] = True
        return values
