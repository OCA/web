# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

"""
This file contains some code to make "Refresh on server changes" feature work.
There are three execution points to achieve it:

[***] 1. Server patch to base model to collect all server changes
         and pass them to "bus.bus".
[   ] 2. JS Controller patch and OWL Component that subscribes to longpolling
         notification and process some heuristics to determine if refresh
         is necessary. If heuristics don't match server request is performed.
[*  ] 3. Server controller that makes db query and determine if refresh is
         necessary for current view state (domain, context, folds, etc.)

Asterisks [*] indicate how many code for this execution point is placed in this file.
"""

from collections import defaultdict

from odoo import SUPERUSER_ID, api, models
from odoo.models import VALID_AGGREGATE_FUNCTIONS
from odoo.modules import registry

_IGNORED_MODELS = [
    "bus.bus",
    "bus.presence",
    "website.visitor",
    "website.track",
]

VALID_AGGREGATE_FUNCTIONS.add("grouping")


def monkey_patch(cls):
    """ Return a method decorator to monkey-patch the given class. """

    def decorate(func):
        name = func.__name__
        func.super = getattr(cls, name, None)
        setattr(cls, name, func)
        return func

    return decorate


def get_modified_records(self, new_value=None):
    if not hasattr(self, "_modified_records"):
        self._modified_records = defaultdict(set)
    old_value = self._modified_records
    if new_value is not None:
        self._modified_records = new_value
    return old_value


registry.Registry.get_modified_records = get_modified_records


@monkey_patch(registry.Registry)
def signal_changes(self):
    signal_changes.super(self)
    records = self.get_modified_records(defaultdict(set))
    if records:
        records = {k: list(v) for k, v in records.items() if k not in _IGNORED_MODELS}
        if records:
            with self.cursor() as cr:
                env = api.Environment(cr, SUPERUSER_ID, {})
                env["bus.bus"].sendone("web_refresh", records)
                env["bus.bus"].flush()


class Base(models.AbstractModel):
    _inherit = "base"

    #####################################################################################
    # Methods to collect changes in registry for sending them to bus.bus after db commit
    #####################################################################################
    @api.model
    def flush(self, fnames=None, records=None):
        if (
            self.env["res.users"]
            .browse(SUPERUSER_ID)
            .has_group("web_refresh.group_watch_changes")
            and self._register
            and not self._abstract
            and not self._transient
        ):
            modified_records = self.env.registry.get_modified_records()
            for key, value in self.env.all.towrite.items():
                modified_records[key] |= set(value.keys())
        super().flush(fnames, records)

    @api.model
    def _create(self, data_list):
        ret = super()._create(data_list)
        if (
            self.env["res.users"]
            .browse(SUPERUSER_ID)
            .has_group("web_refresh.group_watch_changes")
            and self._register
            and not self._abstract
            and not self._transient
        ):
            self.env.registry.get_modified_records()[self._name] |= {0}
        return ret

    def unlink(self):
        ret = super().unlink()
        if (
            self.ids
            and self.env["res.users"]
            .browse(SUPERUSER_ID)
            .has_group("web_refresh.group_watch_changes")
            and self._register
            and not self._abstract
            and not self._transient
        ):
            self.env.registry.get_modified_records()[self._name] |= set(self.ids)
        return ret

    #########################################################################################
    # Methods to make queries like SELECT grouping(...) FROM ... GROUP BY CUBE(...) possible
    #########################################################################################
    @api.model
    def _read_group_prepare(
        self, orderby, aggregated_fields, annotated_groupbys, query
    ):
        if self.env.context.get("group_by_cube") and len(annotated_groupbys):
            cube_groups = []
            for field in annotated_groupbys:
                ret = super(Base, self)._read_group_prepare(
                    orderby, aggregated_fields, [field], query
                )
                cube_groups.append(ret[0])
            return [
                "CUBE("
                + ", ".join(["(" + ", ".join(group) + ")" for group in cube_groups])
                + ")"
            ], ret[1]
        else:
            return super(Base, self)._read_group_prepare(
                orderby, aggregated_fields, annotated_groupbys, query
            )

    @api.model
    def _inherits_join_calc(self, alias, fname, query):
        groups = self.env.context.get("group_by_cube")
        if groups and fname == "id":
            group_fields = []
            for group in groups:
                group_fields.append(super()._inherits_join_calc(alias, group, query))
            return ", ".join(group_fields)
        return super()._inherits_join_calc(alias, fname, query)

    @api.model
    def _apply_ir_rules(self, query, mode="read"):
        super(Base, self.with_context(group_by_cube=False))._apply_ir_rules(query, mode)
