# Copyright 2024 Ilyas
# License AGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

from odoo import api, fields, models


class View(models.Model):
    _inherit = "ir.ui.view"

    hide_empty_groups = fields.Boolean(default=False)


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def web_read_group(
        self,
        domain,
        fields,
        groupby,
        limit=None,
        offset=0,
        orderby=False,
        lazy=True,
        expand=False,
        expand_limit=None,
        expand_orderby=False,
    ):
        res = super().web_read_group(
            domain,
            fields,
            groupby,
            limit,
            offset,
            orderby,
            lazy,
            expand,
            expand_limit,
            expand_orderby,
        )
        if self.env.context.get("params"):
            action = self.env["ir.actions.act_window"].browse(
                self.env.context["params"]["action"]
            )
            if action.view_id and action.view_id.hide_empty_groups:
                new_res = res.copy()
                new_res["groups"] = []
                for group in res["groups"]:
                    if (
                        group.get(groupby[0] + "_count")
                        and group[groupby[0] + "_count"] > 0
                        or group.get("__count")
                        and group["__count"] > 0
                    ):
                        new_res["groups"].append(group)
                return new_res
        return res

    @api.model
    def _read_group_raw(
        self, domain, fields, groupby, offset=0, limit=None, orderby=False, lazy=True
    ):
        res = super()._read_group_raw(
            domain, fields, groupby, offset, limit, orderby, lazy
        )
        if self.env.context.get("action_data") and self.env.context.get("view_type"):
            action_data = self.env.context["action_data"]
            view_type = self.env.context["view_type"]  # list or gantt
            view_data = list(filter(lambda d: d["type"] == view_type, action_data))
            if view_data:
                view = self.env["ir.ui.view"].browse(int(view_data[0]["viewID"]))
                if view and view.hide_empty_groups:
                    new_res = []
                    for group in res:
                        if (
                            group.get(groupby[0] + "_count")
                            and group[groupby[0] + "_count"] > 0
                            or group.get("__count")
                            and group["__count"] > 0
                        ):
                            new_res.append(group)
                    return new_res
        return res
