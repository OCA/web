# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
# from functools import reduce

import base64
import datetime
import functools
import itertools
import json  # We use `dump(vals, separators=(',', ':'))` for mimicking JSON.stringify
import re
import time

from odoo import fields, models
from odoo.tools import (
    DEFAULT_SERVER_DATE_FORMAT,
    DEFAULT_SERVER_DATETIME_FORMAT,
    DEFAULT_SERVER_TIME_FORMAT,
)
from odoo.tools.safe_eval import safe_eval

import dateutil
from dateutil.relativedelta import relativedelta
from pytz import timezone

from ..tools import get_hash


class PwaCache(models.Model):
    _name = "pwa.cache"
    _description = "PWA Cache"

    name = fields.Char(string="Name", required=True, translate=True)
    active = fields.Boolean(
        "Active",
        default=True,
        help="By unchecking the active field, you may hide an CACHE you will not use.",
    )
    cache_type = fields.Selection(
        [
            ("model", "Model"),
            ("clientqweb", "Client QWeb"),
            ("function", "Function"),
            ("onchange", "Onchange"),
            ("onchange_formula", "Onchange with formula"),
            ("post", "Post"),
            ("get", "Get"),
            ("default_formula", "Default values with formula"),
        ],
        string="Type",
        required=True,
    )
    model_id = fields.Many2one(comodel_name="ir.model", string="Model")
    model_name = fields.Char(
        related="model_id.model", string="Model Name", readonly=True, store=True,
    )
    model_domain = fields.Char(
        string="Domain", related="model_domain_raw", readonly=False, store=False,
    )
    model_domain_raw = fields.Char("Domain (RAW)", default="[]")
    model_field_included_ids = fields.Many2many(
        comodel_name="ir.model.fields",
        string="Included fields",
        relation="pwa_cache_ir_model_fields_rel",
        column1="pwa_cache_id",
        column2="field_id",
        domain="[['model_id', '=', model_id]]",
    )
    function_name = fields.Char()
    function_params = fields.Char()
    xml_refs = fields.Text(string="XML Ref's")
    code_js = fields.Text(
        string="Javascript code",
        default='return {"value": {}}',
        help="Formula must be return an 'onchange' object\n"
        "Here you can use the active record changes fields directly.\n"
        "To return an onchange:\n"
        "// return {\n"
        '//        "value": {\n'
        '//            "field_a": value_a,\n'
        "//        },\n"
        '//        "warning": {\n'
        '//            "title": "Ooops!",\n'
        '//            "message": "This is a warning message",\n'
        "//        },\n"
        '//        "domain": {\n'
        '//            "field_a": [],\n'
        "//        }\n"
        "//}\n",
    )
    post_url = fields.Char(string="Post URL")
    post_params = fields.Char()
    get_urls = fields.Text(string="Get URL's")
    group_ids = fields.Many2many(
        comodel_name="res.groups",
        string="Allowed groups",
        relation="pwa_cache_res_group_rel",
        column1="pwa_cache_id",
        column2="group_id",
        help="Allowed groups to get this cache. Empty for all.",
    )
    onchange_field_id = fields.Many2one(
        comodel_name="ir.model.fields",
        string="Onchage field",
        domain="[['model_id', '=', model_id]]",
        index=True,
        ondelete="cascade",
    )
    onchange_field_name = fields.Char(
        related="onchange_field_id.name", string="Field Name", store=True,
    )
    onchange_selector_ids = fields.One2many(
        string="Onchange Selectors",
        comodel_name="pwa.cache.onchange",
        inverse_name="pwa_cache_id",
    )
    onchange_trigger_ids = fields.One2many(
        string="Update Triggers",
        comodel_name="pwa.cache.onchange.trigger",
        inverse_name="pwa_cache_id",
    )
    onchange_value_ids = fields.One2many(
        string="Onchange Values",
        comodel_name="pwa.cache.onchange.value",
        inverse_name="pwa_cache_id",
    )
    internal = fields.Boolean(string="Is an internal record", default=False)

    def _get_text_field_lines(self, records, field_name):
        return list(
            {url for urls in records.mapped(field_name) if urls for url in urls.split()}
        )

    def enqueue_onchange_cache(self, prefilled_selectors=None):
        """Enqueue onchange cache update."""
        self.with_delay().update_onchange_cache(
            prefilled_selectors=prefilled_selectors, autocommit=True
        )

    def update_onchange_cache(self, prefilled_selectors=None, autocommit=False):
        """Refresh combination set and enqueue atomic combinations cache updates."""
        vals_list, disposable = self._get_onchange_selectors(
            prefilled_selectors=prefilled_selectors
        )
        self._update_onchange_cache(
            vals_list, disposable, not bool(prefilled_selectors), autocommit=autocommit
        )

    def _get_onchange_selectors(self, prefilled_selectors=None):
        """Combine all posible parameter values for the onchange calls."""
        self.ensure_one()
        if prefilled_selectors is None:
            prefilled_selectors = {}
        combinations = {}
        mappings = {}
        disposable = []
        context = {
            "env": self.env,
            "functools": functools,
            "itertools": itertools,
        }
        # Prepare values according specification
        for selector in self.onchange_selector_ids:
            field = selector.field_name
            if selector.disposable:
                disposable.append(field)
            if field in prefilled_selectors:
                combinations[field] = prefilled_selectors[field]
                continue
            groups = list(set(re.findall("{{(.*?)}}", selector.expression)))
            if any(groups):
                field_mapping = mappings.setdefault(
                    field, {"groups": groups, "values": {}}
                )
                selectors = [combinations[group] for group in groups]
                # Replace placeholders by improbable variable names
                idents = {group: "_" + group.replace(".", "_0_") for group in groups}
                for values in itertools.product(*selectors):
                    expression = selector.expression
                    for group in groups:
                        expression = expression.replace("{{%s}}" % group, idents[group])
                    ctx = {idents[groups[i]]: value for i, value in enumerate(values)}
                    ctx2 = context.copy()
                    ctx2.update(ctx)
                    result = safe_eval(expression, ctx2)
                    field_mapping["values"][tuple(ctx.values())] = result
            else:
                combinations[field] = safe_eval(selector.expression, context)
        # Traverse values from both definitions
        vals_list = []
        combination_keys = list(combinations.keys())
        for items in itertools.product(*combinations.values()):
            vals = {}
            for selector in self.onchange_selector_ids:
                field = selector.field_name
                if field in combination_keys:
                    vals[field] = items[combination_keys.index(field)]
                elif field in mappings:
                    mapping = mappings[field]
                    groups = mapping["groups"]
                    vals[field] = mapping["values"][tuple([vals[x] for x in groups])]
            vals_list.append(vals)
        return vals_list, disposable

    def _unfold_dict(self, params):
        """Used to restore flatten dictionaries

        For example:
            - In:
                {
                    "order_id.parent_id": 3,
                    "order_id.pricelist_id": 4,
                    "parent_id": 10
                }
            - Out:
                {
                    "order_id": {
                        "parent_id": 3,
                        "pricelist_id": 4
                    },
                    "parent_id": 10
                }
        """
        res = {}
        for key, value in params.items():
            levels = key.split(".")
            if len(levels) > 1:
                parent_level = res
                for level in levels[0:-1]:
                    parent_level.setdefault(level, {})
                    parent_level = parent_level[level]
                parent_level[levels[-1]] = value
            else:
                res[key] = value
        return res

    def _update_onchange_cache(
        self, vals_list, disposable, delete_old=False, autocommit=False
    ):
        self.ensure_one()
        model = self.env[self.model_name]
        obj = self.env["pwa.cache.onchange.value"].sudo()
        onchange_spec = model._onchange_spec()
        # Using IDs for performance reason vs recordset operations
        if delete_old:
            existing_ids = set(self.sudo().onchange_value_ids.ids)
            found_ids = set()
        for vals in vals_list:
            # Put ID instead of recordsets reference
            for key, item in vals.items():
                if isinstance(item, models.BaseModel):
                    vals[key] = item.id
            vals_clean = vals.copy()
            for item in disposable:
                del vals_clean[item]
            vals = self._unfold_dict(vals)
            # vals_clean = self._unfold_dict(vals_clean)
            vals_clean = json.dumps(vals_clean, separators=(",", ":"))
            # Generate unique hash
            ref_hash = get_hash(
                "{}{}{}".format(self.id, self.onchange_field_name, vals_clean)
            )
            if delete_old:
                record = obj.search([("ref_hash", "=", ref_hash)])
                if record:
                    found_ids.add(record.id)
            self.with_delay()._update_onchange_cache_value(
                vals, vals_clean, ref_hash, onchange_spec
            )
            if autocommit:
                self.env.cr.commit()  # pylint: disable=E8102
        if delete_old:
            remaining_ids = existing_ids - found_ids
            if remaining_ids:
                obj.browse(remaining_ids).unlink()

    def _update_onchange_cache_value(self, vals, values, ref_hash, onchange_spec):
        result = json.dumps(
            self.env[self.model_name].onchange(
                vals, self.onchange_field_name, onchange_spec
            )
        )
        vals = json.dumps(vals, separators=(",", ":"))  # JSONify after calling onchange
        obj = self.env["pwa.cache.onchange.value"].sudo()
        record = obj.search([("ref_hash", "=", ref_hash)])
        if record:
            # We assume the same order for returned results, and if not, the
            # worst thing is that the cache value is refreshed
            if record.result != result:
                record.write({"result": result})
        else:
            obj.create(
                {
                    "pwa_cache_id": self.id,
                    "values": values,
                    "ref_hash": ref_hash,
                    "result": result,
                }
            )

    def _get_eval_context(self, action=None):
        """ evaluation context to pass to safe_eval """
        self.ensure_one()

        def context_today():
            return fields.Date.context_today(self)

        return {
            "env": self.env,
            "uid": self._uid,
            "user": self.env.user,
            "record": self,
            "time": time,
            "datetime": datetime,
            "dateutil": dateutil,
            "timezone": timezone,
            "b64encode": base64.b64encode,
            "b64decode": base64.b64decode,
            "DEFAULT_SERVER_DATETIME_FORMAT": DEFAULT_SERVER_DATETIME_FORMAT,
            "DEFAULT_SERVER_DATE_FORMAT": DEFAULT_SERVER_DATE_FORMAT,
            "DEFAULT_SERVER_TIME_FORMAT": DEFAULT_SERVER_TIME_FORMAT,
            "context_today": context_today,
            "relativedelta": relativedelta,
        }


class PwaCacheOnchange(models.Model):
    _name = "pwa.cache.onchange"
    _description = "PWA Cache Onchange Selector"
    _order = "sequence asc, id asc"

    pwa_cache_id = fields.Many2one(
        comodel_name="pwa.cache",
        auto_join=True,
        ondelete="cascade",
        index=True,
        required=True,
    )
    sequence = fields.Integer(default=10)
    field_name = fields.Char(required=True)
    grouping_field = fields.Char()
    expression = fields.Text(required=True)
    disposable = fields.Boolean()
    required = fields.Boolean()


class PwaCacheOnchangeValue(models.Model):
    _name = "pwa.cache.onchange.value"
    _description = "PWA Cache Onchange Value"
    _order = "ref_hash"

    pwa_cache_id = fields.Many2one(
        comodel_name="pwa.cache",
        auto_join=True,
        ondelete="cascade",
        index=True,
        required=True,
    )
    field_name = fields.Char(related="pwa_cache_id.onchange_field_name", store=True)
    values = fields.Char(required=True)
    # The ORM only supports integers of 4 bytes but we use 64bit hashes
    # to avoid as much as possible hash collisions...
    # We can store the value as string because sqlite will use integers
    # of 8 bytes to store the value
    ref_hash = fields.Char(required=True, index=True)
    result = fields.Char(required=True)

    _sql_constraints = [
        (
            "pwa_cache_onchange_value_uniq",
            "unique(pwa_cache_id, field_name, values)",
            "The PWA onchange cache value must be unique.",
        ),
    ]


class PwaCacheOnchangeTrigger(models.Model):
    _name = "pwa.cache.onchange.trigger"
    _description = "Trigger for updating PWA Cache Onchange"

    pwa_cache_id = fields.Many2one(
        comodel_name="pwa.cache",
        auto_join=True,
        ondelete="cascade",
        index=True,
        required=True,
    )
    trigger_type = fields.Selection(
        selection=[
            ("create", "Create"),
            ("unlink", "Unlink"),
            ("create_unlink", "Create & Unlink"),
            ("complete", "Create, Update & Unlink"),
            ("update", "Update"),
        ],
        required=True,
    )
    field_name = fields.Char(required=True)
    model = fields.Char(string="Affected model", required=True)
    selector_expression = fields.Text(
        required=True,
        default="result = self",
        help="Python expression for returning the records that will be passed as "
        "selectors for the given field_name that will be recomputed. It should "
        "be stored in a variable named 'result'.",
    )
    vals_discriminant = fields.Char(
        string="Update values discriminants",
        help="If filled, it will express the updated fields on the affected model "
        "split by commas that will launch the recomputation. If an update on "
        "other fields happens, no recomputation will be launched. Keep it empty "
        "for launching the recomputation on any update on the affected model.",
    )
