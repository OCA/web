# Copyright 2022 Camptocamp SA
# @author Simone Orsi <simahawk@gmail.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import http

from odoo.addons.web.controllers.main import WebClient


class WebClientPatched(WebClient):
    """Handle conversions of modules' ids to their names."""

    def _get_mod_names(self, mods):
        """Retrieve module names from their IDs in any form."""
        mod_names = mods
        model = http.request.env["ir.module.module"].sudo()
        if isinstance(mods, str):
            mods = [int(x.strip()) for x in mods.split(",") if x.strip().isdigit()]
        if mods and isinstance(mods[0], int):
            mod_names = model.browse(mods).mapped("name")
        return mod_names

    @http.route()
    def qweb(self, unique, mods=None, db=None):
        # Here `mods` comes as 1,2,3,4 string
        mods = self._get_mod_names(mods)
        return super().qweb(unique, mods=mods, db=db)

    @http.route()
    def bootstrap_translations(self, mods):
        mods = self._get_mod_names(mods)
        return super().bootstrap_translations(mods)

    @http.route()
    def csslist(self, mods=None):
        mods = self._get_mod_names(mods)
        return super().csslist(mods=mods)

    @http.route()
    def jslist(self, mods=None):
        mods = self._get_mod_names(mods)
        return super().jslist(mods=mods)

    @http.route()
    def translations(self, unique, mods=None, lang=None):
        mods = self._get_mod_names(mods)
        mods = ",".join(mods)
        return super().translations(unique, mods, lang)
