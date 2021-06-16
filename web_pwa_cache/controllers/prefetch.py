# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import logging

from odoo import _, http
from odoo.exceptions import ValidationError
from odoo.http import request, route
from odoo.tools import safe_eval

from odoo.addons.web_pwa_oca.controllers.main import PWA

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
        ir_ui_menu_obj = request.env["ir.ui.menu"]
        menus = ir_ui_menu_obj.load_menus(False)
        menu_ids = ir_ui_menu_obj.browse(menus["all_menu_ids"])
        actions = []
        for menu_id in menu_ids:
            if not menu_id.action:
                continue
            actions.append("{},{}".format(menu_id.action.type, menu_id.action.id))
        return actions

    def _pwa_prefetch_action(self, last_update, **kwargs):
        actions = self._get_pwa_available_actions()
        action_ids = list(map(lambda x: x.split(",")[1], actions))
        domain = [
            ("id", "in", action_ids),
        ]
        if last_update:
            domain.append(("write_date", ">=", last_update))
        actions = request.env["ir.actions.actions"].search(domain)
        return actions.ids

    def _pwa_prefetch_default_formula(self, last_update, **kwargs):
        records = request.env["pwa.cache"].search(
            self._get_pwa_cache_domain(["default_formula"])
        )
        res = []
        for record in records:
            res.append(
                {
                    "id": record.id,
                    "model": record.model_id.model,
                    "formula": record.code_js,
                }
            )
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
            model_views[action_id.res_model] |= set(action_id.view_ids.ids) | {
                action_id.view_id.id,
                action_id.search_view_id.id,
            }

        ir_ui_view_obj = request.env["ir.ui.view"]
        available_types = list(
            filter(
                lambda x: x != "qweb",
                map(lambda x: x[0], ir_ui_view_obj._fields["type"].selection),
            )
        )
        model_domain = []
        if last_update:
            model_domain.append(("write_date", ">=", last_update))
        model_ids = request.env["ir.model"].sudo().search(model_domain)
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
                    ("type", "!=", "qweb"),
                ]
                if last_update:
                    view_domain.append(("write_date", ">=", last_update))
                view_list = ir_ui_view_obj.search_read(view_domain, ["type"])
                for view in view_list:
                    view_types[view["type"]].append(view["id"])
            model_obj = request.env[model_id.model]
            model_fields = model_obj.fields_get()
            try:
                model_defaults = model_obj.default_get(list(model_fields.keys()))
            except Exception:
                model_defaults = False
            res.append(
                {
                    "model": model_id.model,
                    "name": model_id.name,
                    "orderby": model_obj._order,
                    "rec_name": model_obj._rec_name or "name",
                    "fields": model_fields,
                    "view_types": view_types,
                    "parent_store": model_obj._parent_store,
                    "parent_name": model_obj._parent_name,
                    "inherits": model_obj._inherits,
                    "table": model_obj._table,
                    "defaults": model_defaults,
                }
            )
        return res

    def _pwa_calculate_model_info_count(self, model_infos, last_update):
        for model_info in model_infos:
            model_obj = request.env[model_info["model"]]
            model = model_info["model"]
            if model in last_update:
                model_info["count"] = model_obj.search_count(
                    [("write_date", ">=", last_update[model])] + model_info["domain"]
                )
            else:
                model_info["count"] = model_obj.search_count(model_info["domain"])

    def _pwa_prefetch_model(self, last_update, **kwargs):
        records = request.env["pwa.cache"].search(self._get_pwa_cache_domain(["model"]))
        model_infos = []
        for record in records:
            model = record.model_id.model
            model_obj = request.env[model]
            evaluated_domain = safe_eval(
                record.model_domain or "[]", record._get_eval_context()
            )
            records_count = 0
            if model in last_update:
                records_count = model_obj.search_count(
                    [("write_date", ">=", last_update[model])] + evaluated_domain
                )
            else:
                records_count = model_obj.search_count(evaluated_domain)
            if records_count == 0:
                continue
            excluded_fields = record.model_field_excluded_ids.mapped("name")
            # Remove sensitive data
            if model == "res.users":
                excluded_fields.append("password")
            model_infos.append(
                {
                    "model": model,
                    "domain": evaluated_domain,
                    "excluded_fields": list(set(excluded_fields)),
                    "count": records_count,
                }
            )
        # Calculate counts
        self._pwa_calculate_model_info_count(model_infos, last_update)
        return model_infos

    def _pwa_prefetch_clientqweb(self, **kwargs):
        records = request.env["pwa.cache"].search(
            self._get_pwa_cache_domain(["clientqweb"])
        )
        xml_refs = request.env["pwa.cache"]._get_text_field_lines(records, "xml_refs")
        return xml_refs

    def _pwa_prefetch_post(self, **kwargs):
        records = request.env["pwa.cache"].search(self._get_pwa_cache_domain(["post"]))
        post_defs = []
        for record in records:
            post_defs.append(
                {"url": record.post_url, "params": record.post_params,}
            )
        return post_defs

    def _pwa_prefetch_userdata(self, **kwargs):
        from odoo.addons.web.controllers.main import module_boot

        return {
            "list_modules": module_boot(),
            "lang": request.env.lang,
        }

    def _pwa_prefetch_function(self, **kwargs):
        records = request.env["pwa.cache"].search(
            self._get_pwa_cache_domain(["function"])
        )
        functions = []
        for record in records:
            record_obj = request.env[record.model_id.model]
            func_ref = getattr(record_obj, record.function_name)
            if func_ref:
                result = func_ref(**(record.function_params or {}))
                functions.append(
                    {
                        "model": record.model_id.model,
                        "method": record.function_name,
                        "params": record.function_params,
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
                    del kwargs["last_update"]
                return prefetch_method(last_update=last_update, **kwargs)
        return []

    @http.route("/web/pwa/browse_read", type="json", auth="user")
    def pwa_browse_read(self, model, ids, fields):
        records = request.env[model].browse(ids)
        if not records:
            return []

        if fields and fields == ["id"]:
            # shortcut read if we only want the ids
            return [{"id": record.id} for record in records]

        # read() ignores active_test, but it would forward it to any downstream
        # search call (e.g. for x2m or function fields), and this is not the
        # desired behavior, the flag was presumably only meant for the main
        # search().
        # TODO: Move this to read() directly?
        if "active_test" in request._context:
            context = dict(request._context)
            del context["active_test"]
            records = records.with_context(context)

        result = records.read(fields)
        if len(result) <= 1:
            return result

        # reorder read
        index = {vals["id"]: vals for vals in result}
        return [index[record.id] for record in records if record.id in index]
