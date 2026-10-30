# © 2022 Florian Kantelberg - initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    @classmethod
    def _sanitize_cookies(cls, cookies):
        """Set the color_scheme cookie before template rendering."""
        super()._sanitize_cookies(cookies)
        user = request.env.user
        if getattr(user, "dark_mode_device_dependent", None):
            return
        user_scheme = "dark" if getattr(user, "dark_mode", None) else "light"
        if cookies.get("color_scheme") != user_scheme:
            cookies["color_scheme"] = user_scheme
            request.future_response.set_cookie("color_scheme", user_scheme)
