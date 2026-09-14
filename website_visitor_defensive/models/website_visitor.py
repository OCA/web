import logging

import psycopg2

from odoo import models

_logger = logging.getLogger(__name__)


class WebsiteVisitor(models.Model):
    _inherit = "website.visitor"

    def _get_visitor_from_request(self, force_create=False, force_track_values=None):
        # Wrap the super() call in a savepoint so a visitor upsert serialization
        # failure can be rolled back locally. Visitor tracking is best-effort;
        # returning None lets the page finish normally without that track event.
        try:
            with self.env.cr.savepoint():
                return super()._get_visitor_from_request(
                    force_create, force_track_values
                )
        except psycopg2.errors.SerializationFailure as exc:
            _logger.warning("website.visitor upsert serialization: %s", exc)
            return None
        except psycopg2.OperationalError as exc:
            if getattr(exc, "pgcode", None) == "40001":
                _logger.warning(
                    "website.visitor upsert serialization (pgcode 40001): %s", exc
                )
                return None
            raise
