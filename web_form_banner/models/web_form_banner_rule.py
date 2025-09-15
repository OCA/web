# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import logging
import time
import datetime as dt
from functools import lru_cache
from string import Template

from dateutil import parser as dateparse
from dateutil.relativedelta import relativedelta
from lxml import etree
from pytz import timezone

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.tools import html_escape
from odoo.tools.float_utils import float_compare, float_is_zero, float_round
from odoo.tools.safe_eval import safe_eval

_logger = logging.getLogger(__name__)


class _EvalRecordProxy:
    """Read-only-ish view of an existing record with field overrides."""
    __slots__ = ("_b", "_o")

    def __init__(self, base, overrides):
        self._b = base
        self._o = overrides

    def __getattr__(self, name):
        # Prefer explicit overrides; otherwise fall back to the base record
        if name in self._o:
            return self._o[name]
        return getattr(self._b, name)

    def __repr__(self):
        return f"<_EvalRecordProxy base={self._b} overrides={list(self._o.keys())}>"

    @property
    def id(self):
        # Keep the real DB id for RPCs / URL building / permissions
        return self._b.id


_SIMPLE_FIELD_TYPES = frozenset(
    {
        "char", "text", "html", "selection", "boolean",
        "integer", "float", "monetary", "date", "datetime",
    }
)


def _extract_m2o_id(v):
    """Normalize many2one values to an integer id or False.
    Accepts: int, (id, ...) tuple/list, or dict with id-ish keys.
    """
    if isinstance(v, int):
        return v
    if isinstance(v, (list, tuple)) and v and isinstance(v[0], int):
        return v[0]
    if isinstance(v, dict):
        data = v.get("data") or {}
        return v.get("res_id") or data.get("id") or v.get("id") or v.get("ref") or False
    return False


def _sanitize_field(field, value):
    """Return sanitized value for a single field, or None to skip."""
    if not field:
        return None
    if field.type == "many2one":
        return _extract_m2o_id(value)
    if field.type in _SIMPLE_FIELD_TYPES:
        return value
    return None  # skip x2many/reference/others


class WebFormBannerRule(models.Model):
    _name = "web.form.banner.rule"
    _description = "Form Banner Rule"
    _order = "sequence, id"

    name = fields.Char(required=True)
    model_id = fields.Many2one("ir.model", ondelete="cascade", required=True)
    model_name = fields.Char(related="model_id.model", store=True, readonly=True)
    view_ids = fields.Many2many(
        "ir.ui.view",
        string="Views",
        domain="[('type', '=', 'form'), ('model', '=', model_name)]",
        help="Form view where the banner should be injected.",
    )
    target_xpath = fields.Char(
        "Target XPath",
        default="//sheet",
        help="XPath of the node to insert the banner.",
    )
    position = fields.Selection(
        [("before", "Before target"), ("after", "After target")],
        string="Position",
        default="before",
        required=True,
        help="Where to insert the placeholder relative to the first matched node."
    )
    severity = fields.Selection(
        [("info", "Info"), ("warning", "Warning"), ("danger", "Danger")],
        string="Default Severity",
        default="danger",
        required=True,
        help="Default severity level, can be overridden per-record.",
    )
    message = fields.Text(
        translate=True,
        help="Template with ${placeholders}. If not HTML, it will be escaped.",
    )
    message_is_html = fields.Boolean(
        "HTML",
        help="If checked, 'message' is treated as raw HTML (no escaping). "
        "If not checked, the rendered text is escaped and newlines become <br/>."
    )
    message_value_code = fields.Text(
        help="Python expression evaluated server-side. Must return a dict.\n"
        "Keys: visible(bool, default True), severity(str), values(dict for ${...} in \n"
        "message), and/or html(str) to override template rendering.",
    )
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)
    trigger_field_ids = fields.Many2many(
        "ir.model.fields",
        "web_form_banner_rule_trigger_field_rel",
        domain="[('model', '=', model_name)]",
        string="Trigger Fields",
        help="If set, the banner recomputes live when any of these fields change.",
    )

    @api.constrains("target_xpath")
    def _check_target_xpath(self):
        for rec in self:
            xp = (rec.target_xpath or "").strip()
            try:
                etree.XPath(xp or "//sheet")
            except (etree.XPathSyntaxError, etree.XPathEvalError) as e:
                raise ValidationError(_("Invalid XPath:\n%s") % e)

    @api.model
    def _build_form_url(self, rec):
        try:
            if not rec or not getattr(rec, "id", None):
                return ""
            base = self.env["ir.config_parameter"].sudo().get_param(
                "web.base.url", default=""
            )
            return "%s/web#id=%d&model=%s&view_type=form" % (base, rec.id, rec._name)
        except Exception:
            _logger.exception("Failed building form URL for %s", rec)
            return ""

    @lru_cache(maxsize=1)
    def _base_eval_ctx_static(self):
        # Only static, import-heavy items
        return {
            "time": time,
            "datetime": dt,
            "dateutil": {
                "parser": dateparse,
                "relativedelta": relativedelta,
            },
            "timezone": timezone,
            "float_compare": float_compare,
            "float_is_zero": float_is_zero,
            "float_round": float_round,
        }

    @api.model
    def _get_eval_context(self, record):
        eval_ctx = dict(self._base_eval_ctx_static())
        eval_ctx.update(
            {
                "env": record.env,
                "user": record.env.user,
                "ctx": dict(record.env.context),
                "model": record.env[record._name],
                "record": record,
                "context_today": lambda ts=None: fields.Date.context_today(
                    record, timestamp=ts
                ),
                "url_for": self._build_form_url,
            }
        )
        return eval_ctx

    @api.model
    def _sanitize_draft(self, model, form_vals):
        """Return a sanitized dict of simple field values safe for new()/eval."""
        flds = self.env[model]._fields
        out = {}
        for name, value in (form_vals or {}).items():
            sv = _sanitize_field(flds.get(name), value)
            if sv is not None:
                out[name] = sv
        return out

    @api.model
    def _build_eval_record(self, model, res_id, vals):
        """Build the record used for evaluation.
        - existing record: wrap with overrides but keep real id
        - new record: new(vals)
        """
        if not res_id:
            return self.env[model].new(vals) if vals else self.env[model]
        base = self.env[model].browse(int(res_id))
        if not vals:
            return base
        flds = self.env[model]._fields
        ovr = {}
        for n, v in vals.items():
            f = flds[n]
            if not f:
                continue
            if f.type == "many2one" and isinstance(v, int):
                ovr[n] = self.env[f.comodel_name].browse(v)
            else:
                ovr[n] = v
        return _EvalRecordProxy(base, ovr)

    @api.model
    def _run_rule_code(self, rule, eval_ctx):
        """Execute message_value_code and return a dict or {}."""
        if not rule.message_value_code:
            return {}
        code = rule.message_value_code.strip()
        try:
            out = safe_eval(code, eval_ctx, mode="eval") or {}
        except Exception:
            safe_eval(code, eval_ctx, mode="exec", nocopy=True)
            out = eval_ctx.get("result") or {}
        return out if isinstance(out, dict) else {}

    @api.model
    def _render_html(self, rule, values, html):
        """Render final HTML from template if not already provided."""
        if html:
            return html
        tpl = Template(rule.message or "")
        try:
            rendered = tpl.safe_substitute(values)
        except Exception:
            rendered = rule.message or ""
        if rule.message_is_html:
            return rendered
        return html_escape(rendered).replace("\n", "<br/>")

    @api.model
    def compute_message(self, rule_id, model, res_id, form_vals=None):
        """Return {visible, severity, html} for the given rule and record."""
        lang = self._context.get("lang") or self.env.user.lang
        self = self.with_context(lang=lang)
        rule = self.browse(int(rule_id)).sudo()
        if not rule.exists() or not rule.active:
            return {"visible": False}
        vals = self._sanitize_draft(model, form_vals)
        record = self._build_eval_record(model, res_id, vals)
        eval_ctx = self._get_eval_context(record)
        # expose changes for rule code that wants direct access to raw values
        eval_ctx.update(
            {"changes": vals, "current_id": int(res_id) if res_id else False}
        )
        out = self._run_rule_code(rule, eval_ctx) or {}
        severity = out.get("severity", rule.severity or "danger")
        visible = out.get("visible", True)  # default True like before
        if not visible:
            return {"visible": False}
        values = out.get("values") or {
            k: v for k, v in out.items()
            if k not in {"visible", "severity", "values", "html"}
        }
        html = self._render_html(rule, values, out.get("html"))
        return {"visible": True, "severity": severity, "html": html}
