# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
# from functools import reduce

from odoo import api, fields, models

# from odoo.tools.safe_eval import safe_eval


class PwaCache(models.Model):
    _name = "pwa.cache"
    _description = "PWA Cache"

    DEFAULT_JS_CODE = """// Formula must be return an 'onchange' object
// Here you can use the active record changes fields directly.
// To return an onchange:
// return {
//        "value": {
//            "field_a": value_a,
//        },
//        "warning": {
//            "title": "Ooops!",
//            "message": "This is a warning message",
//        },
//        "domain": {
//            "field_a": [],
//        }
//}\n\n\n\n
return {"value": {}}"""  # noqa: E501

    name = fields.Char("Name", required=True, translate=True)
    active = fields.Boolean(
        "Active",
        default=True,
        help="By unchecking the active field, you may hide an CACHE you will not use.",
    )

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
        related="model_id.model", string="Model Name", readonly=True,
    )
    model_domain = fields.Char(
        "Domain", related="model_domain_raw", readonly=False, store=False,
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
        comodel_name="ir.model.fields",
        string="Onchage field",
        domain="[['model_id', '=', model_id]]",
    )
    onchange_field_name = fields.Char(
        related="onchange_field.name", string="Field Name", readonly=True,
    )
    onchange_selector_ids = fields.One2many(
        string="Onchange Selectors",
        comodel_name="pwa.cache.onchange",
        inverse_name="pwa_cache_id",
    )
    onchange_selector_count = fields.Integer(
        compute="_compute_onchange_selector_count", store=False
    )

    internal = fields.Boolean("Is an internal record", default=False)

    def _get_text_field_lines(self, records, field_name):
        return list(
            {url for urls in records.mapped(field_name) if urls for url in urls.split()}
        )

    def update_caches(self):
        self.env["pwa.cache.onchange"].sudo().update_cache()

    @api.depends(
        "onchange_selector_ids",
        "onchange_selector_ids.comodel_name",
        "onchange_selector_ids.expression",
    )
    def _compute_onchange_selector_count(self):
        # TODO
        self.onchange_selector_count = 0
