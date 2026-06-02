# © 2022 Florian Kantelberg - initOS GmbH
# © 2025 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    @classmethod
    def _set_classic_theme(cls, response):
        user = request.env.user
        if user and user._is_internal():
            existing_transient_theme = request.httprequest.cookies.get(
                "transient_classic_theme_cookie"
            )
            persistent_theme = getattr(user, "persistent_classic_theme", None)
            # Delete the cookie so that when persistent gets turned off the user
            # will not be left wondering why nothing changed
            if persistent_theme and existing_transient_theme:
                response.delete_cookie("transient_classic_theme_cookie")

    @classmethod
    def _post_dispatch(cls, response):
        cls._set_classic_theme(response)
        return super()._post_dispatch(response)
