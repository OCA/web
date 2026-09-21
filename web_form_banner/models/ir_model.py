# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def get_view(self, view_id=None, view_type="form", **options):
        res = super().get_view(view_id=view_id, view_type=view_type, **options)
        if view_type != "form" or not res.get("arch"):
            return res
        current_view_id = view_id or res.get("id")
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
            targets = root.xpath(rule.target_xpath or "//sheet")
            if not targets:
                continue
            target = targets[0]
            trigger_fields = ",".join(rule.trigger_field_ids.mapped("name"))
            banner = etree.Element(
                "div",
                {
                    "class": "o_form_banner alert o_invisible_modifier",
                    "role": "status",
                    "data-rule-id": str(rule.id),
                    "data-model": self._name,
                    "data-trigger-fields": trigger_fields,
                },
            )
            in_group = any(a.tag == "group" for a in target.iterancestors())
            if in_group:
                # To avoid the layout distortion issue when the target is inside a group
                banner.set("colspan", "2")
            if rule.position == "before":
                target.addprevious(banner)
            else:
                target.addnext(banner)
        res["arch"] = etree.tostring(root, encoding="unicode")
        return res
