# Copyright 2020 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
import json as simplejson

from lxml import etree

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval


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


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def fields_view_get(
        self, view_id=None, view_type=False, toolbar=False, submenu=False
    ):
        res = super().fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
        )
        if view_type not in ["form", "tree", "kanban"]:
            return res
        # TODO speed up somehow
        restrictions = self.env["custom.field.restriction"].search(
            [
                "|",
                ("model_name", "=", self._name),
                ("group_ids", "in", self.env.user.groups_id.ids),
            ]
        )
        if not restrictions:
            return res
        doc = etree.XML(res["arch"])
        for node in doc.xpath("//field"):
            name = node.attrib.get("name")
            restrictions_filtered = restrictions.filtered(
                lambda x: x.field_id.name == name
            )
            for r in restrictions_filtered:
                if (
                    view_type == "form"
                    and self.env.context.get("params")
                    and self.env.context["params"].get("id")
                ):
                    rec_id = self.env[r.model_name].browse(
                        self.env.context["params"]["id"]
                    )
                    if r.condition_domain:
                        filtered_rec_id = rec_id.filtered_domain(
                            safe_eval(r.condition_domain)
                        )
                        if not filtered_rec_id:
                            continue
                if r.required:
                    node.set("required", "1")
                    modifiers = simplejson.loads(node.get("modifiers"))
                    modifiers["required"] = True
                    node.set("modifiers", simplejson.dumps(modifiers))
                    res["arch"] = etree.tostring(doc)
                if r.invisible:
                    node.set("invisible", "1")
                    modifiers = simplejson.loads(node.get("modifiers"))
                    modifiers["invisible"] = True
                    node.set("modifiers", simplejson.dumps(modifiers))
                    res["arch"] = etree.tostring(doc)
        return res
