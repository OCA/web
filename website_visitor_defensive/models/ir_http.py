import logging

from odoo import models
from odoo.http import request

_logger = logging.getLogger(__name__)


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    @classmethod
    def _get_skip_track_paths(cls):
        # Paths that do not need visitor tracking and are the most likely to
        # cause concurrent upsert contention under heavy public load. Override
        # this method to extend the list from another module
        return (
            "/web/image/",
            "/web/assets/",
            "/website/translations/",
        )

    @classmethod
    def _register_website_track(cls, response):
        # Skip tracking on high-traffic, low-analytics paths to remove the
        # contended website.visitor write path for routes often hit in bursts.
        if request and request.httprequest:
            path = request.httprequest.path or ""
            if path.startswith(cls._get_skip_track_paths()):
                return False

        return super()._register_website_track(response)
