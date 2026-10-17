# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from lxml import etree

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def _add_custom_filters(self, res, custom_fields):
        arch = etree.fromstring(res["arch"])
        for custom_field in custom_fields:
            node = False
            if custom_field.position_after:
                node = arch.xpath(
                    f"//field[@name='{custom_field.position_after_field_name}']"
                )
            if not node:
                # take only field that are leaf (avoid field used as xpath)
                # take the last of these fields
                node = arch.xpath("//field[not(*)][last()]")
            if node:
                # direclty update field if present in view
                elem = arch.xpath(f"//field[@name='{custom_field.field_name}']")
                if elem:
                    elem = elem[0]
                    if custom_field.optional == "hide":
                        elem.set("optional", "hide")
                    elif custom_field.optional == "display":
                        elem.set("optional", "show")
                    elem.set("string", custom_field.name)
                else:
                    vals = {
                        "name": custom_field.field_name,
                        "string": custom_field.name,
                    }

                    if custom_field.optional == "hide":
                        vals["optional"] = "hide"
                    elif custom_field.optional == "display":
                        vals["optional"] = "show"

                    elem = etree.Element(
                        "field",
                        vals,
                    )
                    node[0].addnext(elem)
        res["arch"] = etree.tostring(arch)
        return res

    @api.model
    def get_view(self, view_id=None, view_type="form", **options):
        """Inject fields field in search views."""
        res = super().get_view(view_id, view_type, **options)
        if view_type == "list":
            custom_filters = self.env["ir.ui.custom.list.field"].search(
                [("model_name", "=", res.get("model"))]
            )
            if custom_filters:
                res = self._add_custom_filters(res, custom_filters)
        return res
