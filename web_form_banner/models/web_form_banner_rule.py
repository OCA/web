# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import logging
from string import Template

from dateutil import parser as dateparse
from dateutil.relativedelta import relativedelta
from lxml import etree
from markupsafe import escape
from pytz import timezone

from odoo import _, api, fields, models, tools
from odoo.exceptions import ValidationError
from odoo.tools.float_utils import float_compare, float_is_zero, float_round
from odoo.tools.safe_eval import safe_eval

_logger = logging.getLogger(__name__)


_SIMPLE_FIELD_TYPES = frozenset(
    {
        "char",
        "text",
        "html",
        "selection",
        "boolean",
        "integer",
        "float",
        "monetary",
        "date",
        "datetime",
    }
)


def _extract_m2o_id(v):
    """Normalize many2one values to an integer id or False."""
    if isinstance(v, int):
        return v
    if isinstance(v, list | tuple) and v and isinstance(v[0], int):
        return v[0]
    if isinstance(v, dict):
        m2o_id = v.get("res_id") or v.get("id")
        if isinstance(m2o_id, int):
            return m2o_id
    return False


def _m2m_items(value):
    if isinstance(value, list | tuple):
        return value
    if isinstance(value, dict):
        if isinstance(value.get("resIds"), list | tuple):
            return value["resIds"]
        if isinstance(value.get("data"), list | tuple):
            return value["data"]
    return None


def _to_int_id(e):
    if isinstance(e, int):
        return e
    if isinstance(e, str) and e.isdigit():
        return int(e)
    if isinstance(e, dict):
        rid = e.get("res_id")
        if isinstance(rid, int):
            return rid
        iid = e.get("id")
        if isinstance(iid, int):
            return iid
    return None


def _sanitize_field(field, value):
    """Return sanitized value for a single field, or None to skip."""
    if not field:
        return None
    if field.type == "many2one":
        return _extract_m2o_id(value)
    if field.type == "many2many":
        items = _m2m_items(value)
        if items is None:
            return None
        ids = [i for i in (_to_int_id(e) for e in items) if i is not None]
        # Always return a command, even when empty, to reflect clearing the relation
        return [(6, 0, ids)]
    if field.type in _SIMPLE_FIELD_TYPES:
        return value
    return None  # skip one2many/reference/others


class WebFormBannerRule(models.Model):
    _name = "web.form.banner.rule"
    _description = "Form Banner Rule"
    _order = "sequence, id"

    name = fields.Char(required=True)
    model_id = fields.Many2one("ir.model", ondelete="cascade", required=True)
    model_name = fields.Char(
        related="model_id.model", string="Model Name", store=True, readonly=True
    )
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
        default="before",
        required=True,
        help="Where to insert the placeholder relative to the first matched node.",
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
        "If not checked, the rendered text is escaped and newlines become <br/>.",
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
                raise ValidationError(_("Invalid XPath:\n%s") % e) from e

    @api.model
    def _build_form_url(self, rec):
        try:
            if not rec or not getattr(rec, "id", None):
                return ""
            base = (
                self.env["ir.config_parameter"]
                .sudo()
                .get_param("web.base.url", default="")
            )
            return "%s/web#id=%d&model=%s&view_type=form" % (base, rec.id, rec._name)
        except Exception:
            _logger.exception("Failed building form URL for %s", rec)
            return ""

    @api.model
    def _base_eval_ctx_static(self):
        return {
            "time": tools.safe_eval.time,
            "datetime": tools.safe_eval.datetime,
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
    def _sanitize_values(self, model, form_vals):
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
        """Return (draft, persisted, record_id) for eval context."""
        Model = self.env[model]
        vals = vals or {}
        if res_id:
            persisted = Model.browse(int(res_id))
            base_vals = persisted.read(list(vals.keys()))[0] if vals else {}
            draft = Model.new({**base_vals, **vals})
            return draft, persisted, persisted.id
        # new record (no res_id yet): persisted is an empty recordset, not None
        return Model.new(vals), Model, False

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
        if isinstance(html, str):
            return html
        tpl = Template(rule.message or "")
        try:
            rendered = tpl.safe_substitute(values)
        except Exception:
            rendered = rule.message or ""
        if rule.message_is_html:
            return rendered
        lines = rendered.split("\n")
        escaped_lines = [escape(line) for line in lines]
        return "<br/>".join(escaped_lines)

    @api.model
    def compute_message(self, rule_id, model, res_id, form_vals=None):
        """Return {visible, severity, html} for the given rule and record."""
        lang = self._context.get("lang") or self.env.user.lang
        self = self.with_context(lang=lang)
        rule = self.browse(int(rule_id)).sudo()
        if not rule.exists() or not rule.active:
            return {"visible": False}
        values = self._sanitize_values(model, form_vals)
        draft, record, record_id = self._build_eval_record(model, res_id, values)
        eval_ctx = self._get_eval_context(record)
        eval_ctx.update(
            {
                "draft": draft,  # DB base + simple field overrides
                "record_id": record_id,
            }
        )
        out = self._run_rule_code(rule, eval_ctx) or {}
        severity = out.get("severity", rule.severity or "danger")
        visible = out.get("visible", True)
        if not visible:
            return {"visible": False}
        values = out.get("values") or {
            k: v
            for k, v in out.items()
            if k not in {"visible", "severity", "values", "html"}
        }
        html = self._render_html(rule, values, out.get("html"))
        return {"visible": True, "severity": severity, "html": html}
