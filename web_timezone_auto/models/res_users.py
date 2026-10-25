# Copyright 2026 Altixia (https://www.altixia.com)
# @author: Claude Perrin <claude@altixia.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
"""The user's time zone follows the device.

Odoo only reads the browser time zone at login, from the `tz` cookie set by its own
login page, and only when the user has none (`res.users._login`). A login that skips
that page (an external identity provider) leaves it empty, and travelling never
changes it. Here the web client proposes the device time zone each time the interface
opens (static/src/timezone_service.esm.js) and the server decides.
"""

import pytz

from odoo import api, fields, models
from odoo.http import request


class ResUsers(models.Model):
    _inherit = "res.users"

    tz_auto = fields.Boolean(
        string="Automatic Time Zone",
        default=True,
        help="Follows the time zone of the device in use, read each time the "
        "interface opens: handy when travelling.",
    )

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + ["tz_auto"]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + ["tz_auto"]

    @api.model
    def web_timezone_auto_sync(self, tz):
        """Set the current user's time zone to `tz`, the one of their device.

        Return the time zone the page must use (written, or already the user's own:
        another tab wrote it), or False when the server refuses, without writing
        anything. Writing `tz` clears the server caches (`_get_invalidation_fields`):
        only when it changes.
        """
        user = self.env.user
        if (
            not isinstance(tz, str)
            or tz not in pytz.all_timezones_set
            or not user.tz_auto
            or user._is_superuser()
            # impersonate_login (OCA/server-auth): the browser belongs to someone else
            or (request and request.session.get("impersonate_from_uid"))
        ):
            return False
        if user.tz != tz:
            user.write({"tz": tz})
        # the session context follows, as session_info recomputes it (routes called
        # without a context included)
        if request and request.session.context.get("tz") != tz:
            request.session.context = dict(request.session.context, tz=tz)
        return tz
