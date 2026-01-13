# © 2022 Florian Kantelberg - initOS GmbH
# © 2026 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def color_scheme(self):
        target_scheme, existing_scheme = self._get_color_scheme()
        if target_scheme:
            return target_scheme
        elif existing_scheme:
            return existing_scheme
        else:
            return super().color_scheme()

    @classmethod
    def _get_color_scheme(cls):
        user = request.env.user
        existing_scheme_cookie = None
        target_scheme = None

        if user and user._is_internal():
            # Existing
            existing_scheme_cookie = request.httprequest.cookies.get("color_scheme")
            browser_preference_header = request.httprequest.headers.get(
                "Sec-CH-Prefers-Color-Scheme"
            )
            browser_scheme = (
                browser_preference_header
                if browser_preference_header in ("dark", "light")
                else None
            )
            # User preference
            user_scheme = "dark" if getattr(user, "dark_mode", None) else "light"
            user_device_dependant_scheme = getattr(
                user, "dark_mode_device_dependent", None
            )

            if user_device_dependant_scheme:
                if browser_scheme and existing_scheme_cookie != browser_scheme:
                    target_scheme = browser_scheme

            elif existing_scheme_cookie != user_scheme:
                target_scheme = user_scheme

        return target_scheme, existing_scheme_cookie

    @classmethod
    def _set_color_scheme(cls, response):
        target_scheme, _ = cls._get_color_scheme()
        if target_scheme:
            response.set_cookie("color_scheme", target_scheme)

    @classmethod
    def _post_dispatch(cls, response):
        cls._set_color_scheme(response)
        response.headers.add("Vary", "Sec-CH-Prefers-Color-Scheme")
        response.headers.add("Accept-CH", "Sec-CH-Prefers-Color-Scheme")
        return super()._post_dispatch(response)
