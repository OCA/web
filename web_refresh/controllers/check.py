# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

"""
This file contains some code to make "Refresh on server changes" feature work.
There are three execution points to achieve it:

[   ] 1. Server patch to base model to collect all server changes
         and pass them to "bus.bus".
[   ] 2. JS Controller patch and OWL Component that subscribes to longpolling
         notification and process some heuristics to determine if refresh
         is necessary. If heuristics don't match server request is performed.
[** ] 3. Server controller that makes db query and determine if refresh is
         necessary for current view state (domain, context, folds, etc.)

Asterisks [*] indicate how many code for this execution point is placed in this file.
"""

from odoo.http import Controller, request, route


# This controller contains method to check if current view have to be refreshed.
class CheckChangesController(Controller):
    # Simple case to check. Just compare ids from browser with db search.
    @route("/web_refresh/check_list", type="json", auth="user")
    def check_list(
        self, ids=None, model=None, domain=None, limit=None, offset=0, orderby=None
    ):
        db_ids = (
            request.env[model]
            .search(
                domain, limit=min(limit, len(ids) + 1), offset=offset, order=orderby
            )
            .ids
        )
        if len(db_ids) != len(ids):
            return True
        for i in range(len(ids)):
            if db_ids[i] != ids[i]:
                return True
        return False

    # More complex case to check. Compare groups, then compare ids in each group.
    @route("/web_refresh/check_groups", type="json", auth="user")
    def check_groups(
        self,
        groups=None,
        model=None,
        domain=None,
        limit=None,
        offset=0,
        orderby=None,
        groupby=None,
    ):
        db_groups = request.env[model].read_group(
            domain, ["id"], groupby[:1], offset, limit=limit, orderby=orderby
        )
        if len(db_groups) != len(groups):
            return True
        for i in range(len(groups)):
            key = db_groups[i][groupby[0]]
            if type(key) is tuple:
                key = key[0]
            if (
                key != groups[i]["id"]
                or db_groups[i][groupby[0] + "_count"] != groups[i]["count"]
            ):
                return True
        for i in range(len(groups)):
            inner_groups = groups[i].get("groups", [])
            inner_ids = groups[i].get("ids", [])
            if len(inner_groups) == 0 and len(inner_ids) == 0:
                # Skip folded or empty groups. They was checked by its count.
                continue
            if len(groupby) > 1:
                if self.check_groups(
                    inner_groups,
                    model,
                    db_groups[i]["__domain"],
                    groups[i].get("limit"),
                    groups[i].get("offset", 0),
                    orderby,
                    groupby[1:],
                ):
                    return True
            else:
                if self.check_list(
                    inner_ids,
                    model,
                    db_groups[i]["__domain"],
                    groups[i].get("limit"),
                    groups[i].get("offset", 0),
                    orderby,
                ):
                    return True
        return False

    # Pivot case. Check aggregate for every visible table cells.
    # Measure __count is always present in this check
    # so we don't need special logic for folded groups.
    @route("/web_refresh/check_pivot", type="json", auth="user")
    def check_pivot(
        self, groups=None, model=None, domain=None, groupby=None, measures=None
    ):
        def convert_key(key, set_mask):
            result = []
            for i in range(len(key)):
                k = key[i]
                if set_mask & (1 << (len(key) - i - 1)):
                    result.append("")
                elif k is False:
                    result.append("false")
                elif type(k) is tuple:
                    result.append(str(k[0]))
                else:
                    result.append(k)
            result = ",".join(result).rstrip(",")
            return result

        model = request.env[model]
        fields = list(measures)
        if groupby:
            model = model.with_context(group_by_cube=groupby)
            fields += ["__set:grouping(id)"]
        db_groups = model.read_group(domain, fields, groupby, lazy=False)
        measures = list(map(lambda m: m.split(":")[0], measures))
        if len(groups) == 0 and len(db_groups) != 0:
            return True
        for db_group in db_groups:
            key = convert_key(
                [db_group[group] for group in groupby], db_group.get("__set", 0)
            )
            group = groups.pop(key, None)
            if group is not None:
                if len(group) != len(measures):
                    return True
                for i in range(len(measures)):
                    if group[i] != db_group[measures[i]]:
                        return True
        return len(groups) > 0
