# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import itertools
import json
import logging
import re

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval

_logger = logging.getLogger(__name__)


class PwaCacheOnchange(models.Model):
    _name = "pwa.cache.onchange"
    _description = "PWA Cache Onchange Selector"
    _order = "sequence asc, id asc"

    pwa_cache_id = fields.Many2one(
        comodel_name="pwa.cache", auto_join=True, ondelete="cascade", index=True
    )
    pwa_cache_type = fields.Selection(
        related="pwa_cache_id.cache_type", store=False, readonly=True
    )
    comodel_name = fields.Char(
        compute="_compute_comodel_name", store=False, readonly=True
    )
    comodel_field_name = fields.Char(
        compute="_compute_comodel_name", store=False, readonly=True
    )
    sequence = fields.Integer(default=10)
    field_name = fields.Char()
    grouping_field = fields.Char()
    expression = fields.Text()

    @api.depends("field_name", "pwa_cache_id.model_name")
    def _compute_comodel_name(self):
        for record in self:
            if not record.pwa_cache_id.model_name or not record.field_name:
                self.comodel_name = ""
                return
            fields = (record.field_name or "").split(".")
            comodel_name = record.pwa_cache_id.model_name
            fields_def = self.env[comodel_name]._fields
            comodel_field_name = fields[0]
            for field in fields:
                if not fields_def[field].comodel_name:
                    break
                comodel_name = fields_def[field].comodel_name
                comodel_field_name = fields_def[field].related_field
                fields_def = self.env[comodel_name]._fields
            record.comodel_name = comodel_name
            record.comodel_field_name = comodel_field_name

    def _get_selectors(self, pwa_record):
        """ Combine all posible parameter values for the onchange calls """
        selectors_dict = {}
        for selector in pwa_record.onchange_selector_ids:
            if not selector.expression:
                continue
            groups = set(re.findall("{{(.*?)}}", selector.expression))
            if any(groups):
                selectors = [selectors_dict[group] for group in groups]
                records = []
                # Context names can't use '__' (double underscore)
                idents = {group: "_" + group.replace(".", "_0_") for group in groups}
                for values in itertools.product(*selectors):
                    expression = selector.expression
                    for group in groups:
                        expression = expression.replace("{{%s}}" % group, idents[group])
                    context = {}
                    for i, value in enumerate(values):
                        context[idents[groups[i]]] = value
                    result = safe_eval(expression, context)
                    if isinstance(result, models.BaseModel):
                        records += result
                    else:
                        records += [result]
                selectors_dict[selector.field_name] = records
            else:
                selectors_dict[selector.field_name] = safe_eval(
                    selector.expression, {"env": self.env}
                )
        if selectors_dict:
            import wdb

            wdb.set_trace()

    def _generate_selector_value_records(self, params):
        return [
            {"field_name": field_name, "value": json.dumps(params[field_name])}
            for field_name in params.keys()
        ]

    def update_cache(self):
        _logger.info("Starting cache onchange...")
        # Get onchange types pwa.cache records
        pwa_records = self.env["pwa.cache"].search(
            [
                ("cache_type", "=", "onchange"),
                ("onchange_selector_ids", "!=", False),
                "|",
                ("group_ids", "in", self.env.user.groups_id.ids),
                ("group_ids", "=", False),
            ]
        )
        # Purge current records
        onchange_selector_obj = self.env["pwa.cache.onchange.selector"]
        onchange_selector_obj.search([]).unlink()
        # Run onchanges
        onchanges = []
        for pwa_record in pwa_records:
            selectors = self._get_selectors(pwa_record)
            print(selectors)
            # record_obj = self.env[pwa_record.model_id.model]
            # onchange_spec = record_obj._onchange_spec()
            # for params in selectors:
            #     main_fields = tuple(filter(lambda x: '.' not in x, params))
            #     inflated_params = self._inflate_dict(params)
            #     changes = record_obj.onchange(
            #         inflated_params, main_fields, onchange_spec
            #     )
            #     onchanges.append(
            #         {
            #             "onchange_id": pwa_record.id,
            #             "model": pwa_record.model_id.model,
            #             "changes": json.dumps(changes),
            #             "value_ids": [
            #               (0, 0, values)
            #                   for values in
            #                       self._generate_selector_value_records(params)
            #             ],
            #         }
            #     )
            # self.create(onchanges)
        print(onchanges)
        _logger.info("Onchange caching finished!")

    def _inflate_dict(self, params):
        """ Used to restore flatten dictionaries
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
        for key in params.keys():
            levels = key.split(".")
            parent_level = res
            for level in levels[0:-1]:
                parent_level.setdefault(level, {})
                parent_level = parent_level[level]
            parent_level[levels[-1]] = params[key]
        return res


class PwaCacheOnchangeSelectorValue(models.Model):
    _name = "pwa.cache.onchange.selector"
    _description = "PWA Cache Onchange Selector"

    onchange_id = fields.Many2one(
        comodel_name="pwa.cache.onchange",
        auto_join=True,
        ondelete="cascade",
        index=True,
    )
    field_name = fields.Char()
    values = fields.Char()
