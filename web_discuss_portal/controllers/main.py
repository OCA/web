from odoo import http
from odoo.http import request

from odoo.addons.portal.controllers.portal import CustomerPortal
from odoo.addons.portal.controllers.portal import pager as portal_pager


class DiscussPortal(CustomerPortal):
    def _get_discuss_channel_domain(self):
        return [
            ("channel_type", "=", "channel"),
            ("parent_channel_id", "=", False),
            ("is_member", "=", True),
        ]

    @http.route(
        ["/my/discuss", "/my/discuss/page/<int:page>"],
        type="http",
        auth="user",
        website=True,
    )
    def discuss_portal(self, page=1, **kw):
        Channel = request.env["discuss.channel"]
        domain = self._get_discuss_channel_domain()
        pager_values = portal_pager(
            url="/my/discuss",
            total=Channel.search_count(domain),
            page=page,
            step=self._items_per_page,
        )
        channels = Channel.search(
            domain, limit=self._items_per_page, offset=pager_values["offset"]
        )
        return request.render(
            "web_discuss_portal.discuss_portal",
            {
                "channels": channels,
                "page_name": "discuss",
                "pager": pager_values,
                "default_url": "/my/discuss",
            },
        )
