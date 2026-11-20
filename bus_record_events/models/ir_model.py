import json
import logging
from fnmatch import fnmatchcase

from odoo import api, models, tools

_logger = logging.getLogger(__name__)

PARAM_DENIED_MODELS = "bus_record_events.denied_models"
PARAM_ALLOWED_MODELS = "bus_record_events.allowed_models"
PARAM_IGNORED_FIELDS = "bus_record_events.ignored_fields"

# Models that change constantly as a side effect of normal use, or that no user
# watches in a list. Each one would otherwise emit an event on almost every
# transaction. Override per database with PARAM_ALLOWED_MODELS.
BUILTIN_DENIED_PATTERNS = (
    "base.*",
    "base_import.*",
    "bus.*",
    "ir.*",
    "mail.*",
    "res.device*",
    "res.users.log",
    "res.users.settings*",
    "calendar.attendee",
    "queue.job*",
    "website.track",
    "website.visitor",
    "auditlog.*",
)


def _split_patterns(value):
    return tuple(p.strip() for p in (value or "").split(",") if p.strip())


def _matches(model_name, patterns):
    return any(fnmatchcase(model_name, pattern) for pattern in patterns)


class IrModel(models.Model):
    _inherit = "ir.model"

    @api.model
    @tools.ormcache()
    def _bus_record_events_enabled_models(self):
        """Names of the models whose changes are broadcast.

        A model qualifies when a window action opens it, since only then can a
        user have one of its views open. Code can force the answer with the
        ``_bus_record_events`` class attribute (True or False); otherwise the
        built-in and configured denylists apply, and the allowlist parameter
        overrides the built-in one.

        The cache is the registry default cache, which both ``ir.actions`` and
        ``ir.config_parameter`` clear on write.
        """
        get_param = self.env["ir.config_parameter"].sudo().get_param
        denied = _split_patterns(get_param(PARAM_DENIED_MODELS))
        allowed = _split_patterns(get_param(PARAM_ALLOWED_MODELS))
        with_action = set(
            self.env["ir.actions.act_window"]
            .sudo()
            .search_fetch([("res_model", "!=", False)], ["res_model"])
            .mapped("res_model")
        )
        enabled = set()
        for model_name, model_cls in self.env.registry.items():
            if model_cls._abstract or model_cls._transient or not model_cls._auto:
                continue
            forced = model_cls._bus_record_events
            if forced is not None:
                if forced:
                    enabled.add(model_name)
                continue
            if model_name not in with_action:
                continue
            if _matches(model_name, denied):
                continue
            if _matches(model_name, BUILTIN_DENIED_PATTERNS) and not _matches(
                model_name, allowed
            ):
                continue
            enabled.add(model_name)
        return frozenset(enabled)

    @api.model
    @tools.ormcache("model_name")
    def _bus_record_events_get_ignored_fields(self, model_name):
        """Fields whose writes alone do not emit an event for ``model_name``."""
        # Union over the MRO: each module that inherits the model sets its own
        # tuple, and plain attribute lookup would keep only the last one loaded.
        ignored = {
            field_name
            for cls in type(self.env[model_name]).__mro__
            for field_name in vars(cls).get("_bus_record_events_ignored_fields", ())
        }
        raw = self.env["ir.config_parameter"].sudo().get_param(PARAM_IGNORED_FIELDS)
        if raw:
            try:
                configured = json.loads(raw)
            except ValueError:
                _logger.warning(
                    "Ignoring %s: the value is not valid JSON", PARAM_IGNORED_FIELDS
                )
                configured = {}
            if isinstance(configured, dict):
                ignored.update(configured.get(model_name) or ())
        return frozenset(ignored)
