# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, models
from odoo.exceptions import UserError
from odoo.tools.safe_eval import safe_eval


class BaseModel(models.BaseModel):

    _inherit = "base"

    def _fields_view_get(
        self, view_id=None, view_type="form", toolbar=False, submenu=False
    ):
        """If not exists a 'formPWA' view fallback to form view type"""
        if view_type != "formPWA":
            res = super()._fields_view_get(
                view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu
            )
        else:
            try:
                res = super()._fields_view_get(
                    view_id=view_id,
                    view_type=view_type,
                    toolbar=toolbar,
                    submenu=submenu,
                )
                # formPWA are only for standalone mode
                res["standalone"] = True
            except UserError:
                res = super()._fields_view_get(
                    view_id=view_id, view_type="form", toolbar=toolbar, submenu=submenu
                )
        res["is_default"] = not view_id
        return res

    @api.model
    def load_views(self, views, options=None):
        standalone = options.get("standalone") if options else False
        n_views = views
        if standalone:
            # formPWA is always for generic view
            n_views.append([False, "formPWA"])
        res = super().load_views(n_views, options)
        if standalone and "formPWA" in res["fields_views"]:
            # We found a formPWA, overwrite 'form' with this view.
            # Need do this because we don't modify any action and
            # the client expects to obtain a form.
            # Don't remove 'formPWA' because can be used by "dialog forms"
            res["fields_views"]["form"] = res["fields_views"]["formPWA"]
        return res

    # @api.model
    # def _get_default_formPWA_view(self):
    #     """ Generates a default single-line formPWA view using all fields
    #     of the current model.

    #     :returns: a form view as an lxml document
    #     :rtype: etree._Element
    #     """
    #     return self._get_default_form_view()

    @api.model_create_multi
    def create(self, vals_list):
        """Refresh onchange cache values according new record."""
        res = super().create(vals_list)
        trigger_obj = self.env["pwa.cache.onchange.trigger"].sudo()
        triggers = trigger_obj.search(
            [
                ("model", "=", self._name),
                ("trigger_type", "in", ["create", "create_unlink", "complete"]),
            ]
        )
        for trigger in triggers:
            context = {"env": self.env, "self": res}
            safe_eval(trigger.selector_expression, context, mode="exec", nocopy=True)
            trigger.pwa_cache_id.enqueue_onchange_cache(
                prefilled_selectors={trigger.field_name: context["result"]}
            )
        return res

    def unlink(self):
        """Remove onchange cache entries for unlinked records."""
        trigger_obj = self.env["pwa.cache.onchange.trigger"].sudo()
        triggers = trigger_obj.search(
            [
                ("model", "=", self._name),
                ("trigger_type", "in", ["unlink", "create_unlink", "complete"]),
            ]
        )
        value_obj = self.env["pwa.cache.onchange.value"].sudo()
        for trigger in triggers:
            pwa_cache = trigger.pwa_cache_id
            context = {"env": self.env, "self": self}
            safe_eval(trigger.selector_expression, context, mode="exec", nocopy=True)
            vals_list = pwa_cache._get_onchange_selectors(
                prefilled_selectors={trigger.field_name: context["result"]}
            )
            for vals in vals_list:
                # Put ID instead of recordsets reference
                for key, item in vals.items():
                    if isinstance(item, models.BaseModel):
                        vals[key] = item.id
                vals = pwa_cache._unfold_dict(vals)
                value_obj.search(
                    [("pwa_cache_id", "=", pwa_cache.id), ("values", "=", vals)]
                ).unlink()
        return super().unlink()

    def write(self, vals):
        """Launch the recomputation of affected records of the current change
        according triggers definition.
        """
        res = super().write(vals)
        trigger_obj = self.env["pwa.cache.onchange.trigger"].sudo()
        triggers = trigger_obj.search(
            [("model", "=", self._name), ("trigger_type", "in", ["update", "complete"])]
        )
        selectors = {}
        for trigger in triggers:
            if not trigger.vals_discriminant or any(
                x.strip() in vals for x in trigger.vals_discriminant.split(",")
            ):
                context = {"env": self.env, "self": self}
                safe_eval(
                    trigger.selector_expression, context, mode="exec", nocopy=True
                )
                key = (trigger.pwa_cache_id, trigger.field_name)
                if key in selectors:
                    selectors[key] += context["result"]
                else:
                    selectors[key] = context["result"]
        for key, records in selectors.items():
            key[0].enqueue_onchange_cache(prefilled_selectors={key[1]: records})
        return res
