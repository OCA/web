# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from dateutil.relativedelta import relativedelta
from odoo import api, fields, models
from odoo.exceptions import ValidationError
from odoo.tools.safe_eval import safe_eval, test_python_expr
from odoo.tools import (
    DEFAULT_SERVER_DATETIME_FORMAT,
    DEFAULT_SERVER_DATE_FORMAT,
    DEFAULT_SERVER_TIME_FORMAT)

import base64
import datetime
import time
from pytz import timezone
import dateutil


class PWACache(models.Model):
    _name = "pwa.cache"
    _description = "PWA Cache"

    DEFAULT_PYTHON_CODE = """# Available variables:
#  - env: Odoo Environment on which the request is triggered
#  - user, uid: The user that trigger the request
#  - record: This record
#  - time, datetime, dateutil, timezone: useful Python libraries
#  - b64encode, b64decode: To work with base64
#  - DEFAULT_SERVER_DATETIME_FORMAT, DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_TIME_FORMAT: Odoo date format
#
# To return an params, assign: params = [...]\n\n\n\n"""  # noqa: E501
    DEFAULT_JS_CODE = """// Formula must be return an 'onchange' object
// Here you can use the active record changes fields directly.
// To return an onchange: return {"value": {"field_a": value_a}, "warning": {"title": "Ooops!", "message": "This is a warning message"}, "domain": {"field_a": []}}\n\n\n\n
return {"value": {}}"""  # noqa: E501

    name = fields.Char("Name", required=True, translate=True)
    active = fields.Boolean(
        'Active', default=True,
        help="By unchecking the active field, you may hide an CACHE you will not use.")

    cache_type = fields.Selection(
        [
            ("model", "Model"),
            ("clientqweb", "Client QWeb"),
            ("function", "Function"),
            ("onchange", "Onchange"),
            ("onchange_formula", "Onchange with formula"),
            ("post", "Post"),
            ("get", "Get"),
            ("default_formula", "Default values with formula"),
        ],
        string="Type",
        required=True,
    )

    model_id = fields.Many2one("ir.model", string="Model")
    model_name = fields.Char(
        related="model_id.model",
        string="Model Name",
        readonly=True,
    )
    model_domain = fields.Char(
        "Domain",
        related="model_domain_raw",
        readonly=False,
        store=False,
    )
    model_domain_raw = fields.Char("Domain (RAW)", default="[]")
    model_field_excluded_ids = fields.Many2many(
        comodel_name="ir.model.fields",
        string="Excluded fields",
        relation="pwa_cache_ir_model_fields_rel",
        column1="pwa_cache_id",
        column2="field_id",
        domain="[['model_id', '=', model_id]]",
    )

    function_name = fields.Char("Function Name")

    xml_refs = fields.Text(string="XML Ref's")

    code = fields.Text(string="Python code", default=DEFAULT_PYTHON_CODE)
    code_js = fields.Text(string="Javascript code", default=DEFAULT_JS_CODE)

    post_url = fields.Char(string="Post URL")

    get_urls = fields.Text(string="Get URL's")

    group_ids = fields.Many2many(
        comodel_name="res.groups",
        string="Allowed groups",
        relation="pwa_cache_res_group_rel",
        column1="pwa_cache_id",
        column2="group_id",
        help="Allowed groups to get this cache. Empty for all.",
    )

    onchange_field = fields.Many2one(
        "ir.model.fields",
        string="Onchage field",
        domain="[['model_id', '=', model_id]]",
    )
    onchange_triggers = fields.Char(
        "Onchange Triggers",
        help="Fields separated by commas. Can use dotted notation.",
    )

    internal = fields.Boolean("Is an internal record", default=False)

    @api.constrains("code")
    def _check_python_code(self):
        for cache in self.filtered("code"):
            msg = test_python_expr(expr=cache.code.strip(), mode="exec")
            if msg:
                raise ValidationError(msg)

    def run_cache_code(self, eval_context=None):
        self.ensure_one()
        if self.code:
            safe_eval(self.code.strip(), eval_context, mode="exec", nocopy=True)
            if "params" in eval_context:
                return eval_context["params"] or []
        return [False]

    @api.multi
    def _get_eval_context(self, action=None):
        """ evaluation context to pass to safe_eval """
        self.ensure_one()

        def context_today():
            return fields.Date.context_today(self)

        return {
            "env": self.env,
            "uid": self._uid,
            "user": self.env.user,
            "record": self,
            "time": time,
            "datetime": datetime,
            "dateutil": dateutil,
            "timezone": timezone,
            "b64encode": base64.b64encode,
            "b64decode": base64.b64decode,
            "DEFAULT_SERVER_DATETIME_FORMAT": DEFAULT_SERVER_DATETIME_FORMAT,
            "DEFAULT_SERVER_DATE_FORMAT": DEFAULT_SERVER_DATE_FORMAT,
            "DEFAULT_SERVER_TIME_FORMAT": DEFAULT_SERVER_TIME_FORMAT,
            "context_today": context_today,
            "relativedelta": relativedelta,
        }

    def _get_text_field_lines(self, records, field_name):
        return list(
            {url for urls in records.mapped(field_name) if urls for url in urls.split()}
        )
