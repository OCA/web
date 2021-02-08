# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models, api
from odoo.exceptions import UserError


class BaseModel(models.BaseModel):

    _inherit = 'base'

    def _fields_view_get(self, view_id=None, view_type='form', toolbar=False,
                         submenu=False):
        """If not exists a 'formPWA' view fallback to form view type"""
        if view_type != "formPWA":
            return super()._fields_view_get(
                view_id=view_id,
                view_type=view_type,
                toolbar=toolbar,
                submenu=submenu)
        try:
            res = super()._fields_view_get(
                view_id=view_id,
                view_type=view_type,
                toolbar=toolbar,
                submenu=submenu)
            # formPWA are only for standalone mode
            res["standalone"] = True
        except UserError:
            res = super()._fields_view_get(
                view_id=view_id,
                view_type='form',
                toolbar=toolbar,
                submenu=submenu)
        return res

    @api.model
    def load_views(self, views, options=None):
        standalone = options.get('standalone') if options else False
        n_views = views
        if standalone:
            # formPWA is always for generic view
            n_views.append([False, 'formPWA'])
        res = super().load_views(n_views, options)
        if standalone and 'formPWA' in res['fields_views']:
            # We found a formPWA, overwrite 'form' with this view.
            # Need do this because we don't modify any action and
            # the client expects to obtain a form.
            # Don't remove 'formPWA' because can be used by "dialog forms"
            res['fields_views']['form'] = res['fields_views']['formPWA']
        return res

    # @api.model
    # def _get_default_formPWA_view(self):
    #     """ Generates a default single-line formPWA view using all fields
    #     of the current model.

    #     :returns: a form view as an lxml document
    #     :rtype: etree._Element
    #     """
    #     return self._get_default_form_view()
