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

    def _launch_pwa_cache_update(self, trigger_types, vals=None, remove=False):
        """Check for the updates we need to do according the PWA cache onchange
        triggers, and enqueue them. Triggers are accumulative, so that means that if we
        have several triggers reacting to the same event and PWA cache record, the
        selectors will be computed and accumulated for the same update set, reducing the
        scope of the update in practical terms if you put several field names in them.
        If the triggers are for the same field, they will increase the scope of the
        update, but it's more practical to do all in the same expression code.

        :param trigger_types: types to search for triggers.
        :param vals: values to check if we have to update the records. If not
            provided, we will update always for the given triggers.
        :param remove: If true, it indicates that we should remove the cache values for
            the given set, instead of updating them.
        """
        pwa_cache_obj = self.env["pwa.cache"].sudo()
        trigger_obj = self.env["pwa.cache.onchange.trigger"].sudo()
        domain = [
            ("model", "=", self._name),
            ("trigger_type", "in", trigger_types),
        ]
        groups = trigger_obj.read_group(domain, ["pwa_cache_id"], ["pwa_cache_id"])
        for group in groups:
            selectors = {}
            triggers = trigger_obj.search(group["__domain"])
            for trigger in triggers:
                if (
                    vals
                    and trigger.vals_discriminant
                    and not any(
                        x.strip() in vals for x in trigger.vals_discriminant.split(",")
                    )
                ):
                    continue
                context = {"env": self.env, "self": self}
                safe_eval(
                    trigger.selector_expression, context, mode="exec", nocopy=True
                )
                if trigger.field_name in selectors:
                    selectors[trigger.field_name] += context["result"]
                else:
                    selectors[trigger.field_name] = context["result"]
            pwa_cache = pwa_cache_obj.browse(group["pwa_cache_id"][0])
            if remove and selectors:
                value_obj = self.env["pwa.cache.onchange.value"].sudo()
                vals_list, disposable = pwa_cache._get_onchange_selectors(
                    prefilled_selectors=selectors
                )
                for vals in vals_list:
                    _, _, ref_hash = pwa_cache._prepare_vals_dict(vals, disposable)
                    value_obj.search([("ref_hash", "=", ref_hash)]).unlink()
            elif selectors:
                pwa_cache.enqueue_onchange_cache(prefilled_selectors=selectors)

    @api.model_create_multi
    def create(self, vals_list):
        """Refresh onchange cache values according new records."""
        res = super().create(vals_list)
        res._launch_pwa_cache_update(
            ["create", "create_unlink", "complete", "create_update"]
        )
        return res

    def unlink(self):
        """Remove onchange cache entries for unlinked records."""
        self._launch_pwa_cache_update(
            ["unlink", "create_unlink", "complete"], remove=True
        )
        return super().unlink()

    def write(self, vals):
        """Launch the recomputation of affected records of the current change
        according triggers definition.
        """
        res = super().write(vals)
        self._launch_pwa_cache_update(
            ["update", "create_update", "complete"], vals=vals
        )
        return res
