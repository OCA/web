# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.http import request, route
from odoo import http, _
from odoo.tools import safe_eval
from odoo.exceptions import ValidationError
from odoo.addons.web_pwa_oca.controllers.main import PWA
import logging
_logger = logging.getLogger(__name__)


class PWAPrefetch(PWA):
    def _get_pwa_cache_domain(self, cache_types):
        return [
            ("cache_type", "in", cache_types),
            "|",
            ("group_ids", "in", request.env.user.groups_id.ids),
            ("group_ids", "=", False),
        ]

    def _get_pwa_available_actions(self):
        ir_ui_menu_obj = request.env['ir.ui.menu']
        menus = ir_ui_menu_obj.load_menus(False)
        menu_ids = ir_ui_menu_obj.browse(menus["all_menu_ids"])
        actions = []
        for menu_id in menu_ids:
            if not menu_id.action:
                continue
            actions.append("{},{}".format(
                menu_id.action.type,
                menu_id.action.id))
        return actions

    def _pwa_prefetch_action(self, last_update, **kwargs):
        actions = self._get_pwa_available_actions()
        action_ids = list(map(lambda x: x.split(',')[1], actions))
        domain = [
            ('id', 'in', action_ids),
        ]
        if last_update:
            domain.append(("write_date", ">=", last_update))
        actions = request.env["ir.actions.actions"].search(domain)
        return actions.ids

    def _pwa_prefetch_default_formula(self, last_update, **kwargs):
        records = request.env["pwa.cache"].search(
            self._get_pwa_cache_domain(["default_formula"]))
        res = []
        for record in records:
            res.append({
                'id': record.id,
                'model': record.model_id.model,
                'formula': record.code_js,
            })
        return res

    def _pwa_prefetch_model_info(self, last_update, **kwargs):
        # Get used model names from menus action
        actions = self._get_pwa_available_actions()
        model_views = {}
        actions_id_list = set()
        for action in actions:
            (action_model, action_id) = action.split(",")
            if action_model != "ir.actions.act_window":
                continue
            actions_id_list.add(int(action_id))
        action_ids = request.env[action_model].browse(list(actions_id_list))
        for action_id in action_ids:
            model_views.setdefault(action_id.res_model, set())
            model_views[action_id.res_model] |= set(
                action_id.view_ids.ids) | {
                    action_id.view_id.id,
                    action_id.search_view_id.id}

        ir_ui_view_obj = request.env["ir.ui.view"]
        available_types = list(
            filter(
                lambda x: x != "qweb", map(
                    lambda x: x[0],
                    ir_ui_view_obj._fields['type'].selection)))
        model_domain = []
        if last_update:
            model_domain.append(("write_date", ">=", last_update))
        model_ids = request.env['ir.model'].sudo().search(model_domain)
        res = []
        for model_id in model_ids:
            if model_id.model not in request.env:
                continue
            view_types = {}
            for view_type in available_types:
                # Adds 'False' to get generic view
                view_types.setdefault(view_type, [False])
            if model_id.model in model_views:
                view_domain = [
                    ("id", "in", list(model_views[model_id.model])),
                    ('type', '!=', 'qweb'),
                ]
                if last_update:
                    view_domain.append(("write_date", ">=", last_update))
                view_list = ir_ui_view_obj.search_read(view_domain, ["type"])
                for view in view_list:
                    view_types[view["type"]].append(view["id"])
            model_obj = request.env[model_id.model]
            res.append(
                {
                    "model": model_id.model,
                    "name": model_id.name,
                    "orderby": model_obj._order,
                    "rec_name": model_obj._rec_name or 'name',
                    "fields": model_obj.fields_get(),
                    "view_types": view_types,
                    "parent_store": model_obj._parent_store,
                    "parent_name": model_obj._parent_name,
                    "inherits": model_obj._inherits,
                    "table": model_obj._table,
                }
            )
        return res

    def _pwa_prefetch_model(self, last_update, **kwargs):
        records = request.env["pwa.cache"].search(self._get_pwa_cache_domain(["model"]))
        res = []
        for record in records:
            model = record.model_id.model
            model_obj = request.env[model]
            evaluated_domain = safe_eval(
                record.model_domain or "[]",
                record._get_eval_context())
            records_count = 0
            if model in last_update:
                records_count = model_obj.search_count([
                    ("write_date", ">=", last_update[model]),
                ] + evaluated_domain)
            else:
                records_count = model_obj.search_count(evaluated_domain)
            if records_count == 0:
                continue
            res.append(
                {
                    "model": model,
                    "domain": evaluated_domain,
                    "excluded_fields": record.model_field_excluded_ids.mapped("name"),
                    "count": records_count,
                }
            )
        return res

    def _pwa_prefetch_clientqweb(self, **kwargs):
        records = request.env["pwa.cache"].search(
            self._get_pwa_cache_domain(["clientqweb"])
        )
        return request.env["pwa.cache"]._get_text_field_lines(records, "xml_refs")

    def _pwa_prefetch_post(self, **kwargs):
        records = request.env["pwa.cache"].search(self._get_pwa_cache_domain(["post"]))
        post_defs = []
        for record in records:
            e_context = record._get_eval_context()
            post_defs.append(
                {
                    "url": record.post_url,
                    "params": record.run_cache_code(eval_context=e_context),
                }
            )
        return post_defs

    def _pwa_prefetch_userdata(self, **kwargs):
        from odoo.addons.web.controllers.main import module_boot

        return {
            "list_modules": module_boot(),
            "lang": request.env.lang,
        }

    def _pwa_resolve_params(self, params):
        resolved_params = {}
        for field_name in params:
            if isinstance(params[field_name], list) and len(params[field_name]) == 3:
                if params[field_name][0] == 'r':
                    resolved_params[field_name] = params[field_name][1]
                    continue
            resolved_params[field_name] = params[field_name]
        return resolved_params

    def _pwa_construct_params(self, param_values, field_name, triggers):
        params = {field_name: param_values[field_name]}
        if triggers:
            trigger_fields = triggers.split(",")
            for field in trigger_fields:
                sfield = field.strip()
                if "." not in sfield:
                    params[sfield] = param_values[sfield]
                    continue
                levels = sfield.split(".")
                value = param_values
                temp_arr_value = params
                last_level = levels[0]
                for index in range(len(levels)):
                    level = levels[index]
                    if level not in temp_arr_value:
                        temp_arr_value[level] = {}
                    if index < len(levels)-1:
                        temp_arr_value = temp_arr_value[level]
                    value = value[level]
                    last_level = level
                temp_arr_value[last_level] = value
        return params

    def _pwa_prefetch_onchange(self, **kwargs):
        cache_id = kwargs.get("cache_id")
        if not cache_id:
            values = []
            records = request.env["pwa.cache"].search(
                self._get_pwa_cache_domain(["onchange", "onchange_formula"])
            )
            for record in records:
                e_context = record._get_eval_context()
                params_list = record.run_cache_code(eval_context=e_context)
                values.append({
                    'id': record.id,
                    'name': record.name,
                    'count': len(params_list),
                })
            return values

        record = request.env["pwa.cache"].browse(cache_id)
        if not record or (
            record.cache_type != "onchange"
            and record.cache_type != "onchange_formula"
        ):
            raise ValidationError(_("Invalid onchange cache id"))

        onchanges = []
        e_context = record._get_eval_context()
        record_obj = request.env[record.model_id.model]
        params_list = record.run_cache_code(eval_context=e_context)
        onchange_spec = record_obj._onchange_spec()
        for params in params_list:
            changes = False
            formula = False
            if record.cache_type == "onchange":
                resolved_params = self._pwa_resolve_params(params)
                changes = record_obj.onchange(
                    resolved_params, record.onchange_field.name, onchange_spec
                )
            elif record.cache_type == "onchange_formula":
                formula = record.code_js
            # Remove 'None' values, so they are only used to trigger the change
            s_params = self._pwa_construct_params(
                params,
                record.onchange_field.name,
                record.onchange_triggers)
            onchanges.append(
                {
                    "model": record.model_id.model,
                    "field": record.onchange_field.name,
                    "params": s_params,
                    "changes": changes,
                    "formula": formula,
                    "triggers": record.onchange_triggers,
                    "field_value": params[record.onchange_field.name],
                }
            )
        return onchanges

    def _pwa_prefetch_function(self, **kwargs):
        records = request.env["pwa.cache"].search(
            self._get_pwa_cache_domain(["function"])
        )
        functions = []
        for record in records:
            e_context = record._get_eval_context()
            record_obj = request.env[record.model_id.model]
            params_list = record.run_cache_code(eval_context=e_context)
            for params in params_list:
                params = params or []
                func_ref = getattr(record_obj, record.function_name)
                if func_ref:
                    result = func_ref(*params)
                    functions.append(
                        {
                            "model": record.model_id.model,
                            "method": record.function_name,
                            "params": params,
                            "result": result,
                        }
                    )
        return functions

    @route("/pwa/prefetch/<string:cache_type>", type="json", auth="user")
    def pwa_prefetch(self, cache_type, **kwargs):
        # User dynamic defined caches
        available_types = {
            opt[0] for opt in request.env["pwa.cache"]._fields["cache_type"].selection
        }
        # Fixed caches
        available_types |= {"action", "userdata", "model_default", "model_info"}
        if cache_type in available_types:
            prefetch_method = getattr(self, "_pwa_prefetch_{}".format(cache_type))
            if prefetch_method:
                last_update = kwargs.get("last_update")
                if "last_update" in kwargs:
                    del kwargs['last_update']
                return prefetch_method(last_update=last_update, **kwargs)
        return []

    @http.route('/web/pwa/browse_read', type='json', auth="user")
    def pwa_browse_read(self, model, ids, fields):
        records = request.env[model].browse(ids)
        if not records:
            return []

        if fields and fields == ['id']:
            # shortcut read if we only want the ids
            return [{'id': record.id} for record in records]

        # read() ignores active_test, but it would forward it to any downstream
        # search call (e.g. for x2m or function fields), and this is not the
        # desired behavior, the flag was presumably only meant for the main
        # search().
        # TODO: Move this to read() directly?
        if 'active_test' in request._context:
            context = dict(request._context)
            del context['active_test']
            records = records.with_context(context)

        result = records.read(fields)
        if len(result) <= 1:
            return result

        # reorder read
        index = {vals['id']: vals for vals in result}
        return [index[record.id] for record in records if record.id in index]
