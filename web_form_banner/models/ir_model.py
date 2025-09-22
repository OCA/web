# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def fields_view_get(
        self, view_id=None, view_type="form", toolbar=False, submenu=False
    ):
        res = super().fields_view_get(
            view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
        )
        if view_type != "form" or not res.get("arch"):
            return res
        current_view_id = view_id or res.get("view_id")
        if not current_view_id:
            return res
        rules = (
            self.env["web.form.banner.rule"]
            .sudo()
            .search(
                [
                    ("model_name", "=", self._name),
                    "|",
                    ("view_ids", "in", current_view_id),
                    ("view_ids", "=", False),
                ]
            )
        )
        if not rules:
            return res
        try:
            root = etree.fromstring(res["arch"])
        except Exception:
            return res
        for rule in rules:
            target = root.xpath(rule.target_xpath or "//sheet")
            if not target:
                continue
            # Lightweight placeholder; JS will fill and toggle visibility
            css = "o_form_banner alert alert-%s" % (rule.severity or "danger")
            trigger_fields = ",".join(rule.trigger_field_ids.mapped("name"))
            node = etree.Element(
                "div",
                {
                    "class": css,
                    "role": "alert",
                    "data-rule-id": str(rule.id),
                    "data-model": self._name,
                    "data-default-severity": (rule.severity or "danger"),
                    "data-trigger-fields": trigger_fields,
                    "style": "display:none;",
                },
            )
            parent = target[0].getparent()
            if parent is None:
                continue
            if rule.position == "before":
                parent.insert(parent.index(target[0]), node)
            else:
                target[0].addnext(node)
        res["arch"] = etree.tostring(root, encoding="unicode")
        return res
