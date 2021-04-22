# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import functools
import json
import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class PWACacheOnChange(models.Model):
    _name = "pwa.cache.onchange"
    _description = "PWA Cache Onchange"

    model = fields.Char("Model")
    field = fields.Char("Field")
    field_value = fields.Char("Field Value")
    params = fields.Char("Params")
    changes = fields.Char("Changes")
    formula = fields.Text("Formula")
    trigger_ref = fields.Integer("Trigger Ref")
    triggers = fields.Char("Complete Triggers")

    def update_cache(self):
        _logger.info("Starting cache onchange...")
        # Get onchange types pwa.cache records
        records = self.env["pwa.cache"].search(
            [
                ("cache_type", "in", ["onchange", "onchange_formula"]),
                "|",
                ("group_ids", "in", self.env.user.groups_id.ids),
                ("group_ids", "=", False),
            ]
        )
        # Purge current records
        self.search([]).unlink()
        # Run onchanges
        onchanges = []
        for record in records:
            e_context = record._get_eval_context()
            record_obj = self.env[record.model_id.model]
            params_list = record.run_cache_code(eval_context=e_context)
            onchange_spec = record_obj._onchange_spec()
            for params in params_list:
                changes = False
                formula = False
                if record.cache_type == "onchange":
                    resolved_params = self._resolve_params(params)
                    changes = record_obj.onchange(
                        resolved_params, record.onchange_field.name, onchange_spec
                    )
                elif record.cache_type == "onchange_formula":
                    formula = record.code_js
                # Remove 'None' values, so they are only used to trigger the change
                trigger_config = False
                if params:
                    trigger_config = self._get_trigger_config(
                        params,
                        record.onchange_field.name,
                        record.onchange_triggers,
                        record.onchange_main_trigger,
                    )
                onchanges.append(
                    {
                        "model": record.model_id.model,
                        "field": record.onchange_field.name,
                        "field_value": params and params[record.onchange_field.name],
                        "params": json.dumps(
                            trigger_config and trigger_config["params"] or params
                        ),
                        "changes": json.dumps(changes),
                        "formula": formula,
                        "triggers": record.onchange_triggers,
                        "trigger_ref": trigger_config and trigger_config["trigger_ref"],
                    }
                )
            self.create(onchanges)
        _logger.info("Onchange caching finished!")

    def _resolve_params(self, params):
        resolved_params = {}
        for field_name in params:
            if isinstance(params[field_name], list) and len(params[field_name]) == 3:
                if params[field_name][0] == "r":
                    resolved_params[field_name] = params[field_name][1]
                    continue
            resolved_params[field_name] = params[field_name]
        return resolved_params

    def _get_trigger_config(self, param_values, field_name, triggers, main_trigger):
        trigger_ref = False
        params = {field_name: param_values[field_name]}
        if triggers:
            trigger_fields = triggers.split(",")
            for field in trigger_fields:
                is_main_trigger = field == main_trigger
                sfield = field.strip()
                if "." not in sfield:
                    params[sfield] = param_values[sfield]
                    if is_main_trigger:
                        trigger_ref = "{}:{}".format(field, params[sfield])
                    continue
                levels = sfield.split(".")
                value = param_values
                temp_arr_value = params
                last_level = levels[0]
                for index in range(len(levels)):
                    level = levels[index]
                    if level not in temp_arr_value:
                        temp_arr_value[level] = {}
                    if index < len(levels) - 1:
                        temp_arr_value = temp_arr_value[level]
                    value = value[level]
                    last_level = level
                temp_arr_value[last_level] = value
                if is_main_trigger:
                    trigger_ref = "{}:{}".format(field, temp_arr_value[last_level])
        if trigger_ref:
            trigger_ref_len = len(trigger_ref)
            trigger_ref = [ord(b) for b in trigger_ref]
            trigger_ref = (
                functools.reduce(lambda x, y: x + y, trigger_ref) + trigger_ref_len
            )
        return {
            "params": params,
            "trigger_ref": trigger_ref,
        }
