# © 2010-2013 OpenERP s.a. (<http://openerp.com>).
# © 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
# © 2015-Today GRAP
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

import datetime
import time
from statistics import median
from dateutil.relativedelta import relativedelta
from collections import OrderedDict

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval as eval
from odoo.tools.translate import _
from odoo.exceptions import ValidationError, except_orm


FIELD_FUNCTIONS = OrderedDict(
    [
        (
            "count",
            {
                "name": "Count",
                "func": False,  # its hardcoded in _compute_data
                "help": _("Number of records"),
            },
        ),
        (
            "min",
            {
                "name": "Minimum",
                "func": min,
                "help": _("Minimum value of '%s'"),
            },
        ),
        (
            "max",
            {
                "name": "Maximum",
                "func": max,
                "help": _("Maximum value of '%s'"),
            },
        ),
        (
            "sum",
            {"name": "Sum", "func": sum, "help": _("Total value of '%s'")},
        ),
        (
            "avg",
            {
                "name": "Average",
                "func": lambda vals: sum(vals) / len(vals),
                "help": _("Average value of '%s'"),
            },
        ),
        (
            "median",
            {
                "name": "Median",
                "func": median,
                "help": _("Median value of '%s'"),
            },
        ),
    ]
)


FIELD_FUNCTION_SELECTION = [
    (k, FIELD_FUNCTIONS[k].get("name")) for k in FIELD_FUNCTIONS
]


class TileTile(models.Model):
    _name = "tile.tile"
    _description = "Dashboard Tile"
    _order = "sequence, name"

    # Column Section
    name = fields.Char(required=True)

    sequence = fields.Integer(default=0, required=True)

    category_id = fields.Many2one(
        string="Category", comodel_name="tile.category", required=True,
        ondelete="CASCADE")

    user_id = fields.Many2one(string="User", comodel_name="res.users")

    background_color = fields.Char(default="#0E6C7E")

    font_color = fields.Char(default="#FFFFFF")

    group_ids = fields.Many2many(
        comodel_name="res.groups",
        string="Groups",
        help="If this field is set, only users of this group can view this "
        "tile. Please note that it will only work for global tiles "
        "(that is, when User field is left empty)",
    )

    model_id = fields.Many2one(
        comodel_name="ir.model", string="Model", required=True
    )

    model_name = fields.Char(string="Model name", related="model_id.model")

    domain = fields.Text(default="[]")

    action_id = fields.Many2one(
        comodel_name="ir.actions.act_window",
        string="Action", help="Let empty to use the default action related to"
        " the selected model.",
        domain="[('res_model', '=', model_name)]")

    active = fields.Boolean(
        compute="_compute_active", search="_search_active", readonly=True
    )

    hide_if_null = fields.Boolean(
        string="Hide if null", help="If checked, the item will be hidden"
        " if the primary value is null.")

    hidden = fields.Boolean(
        string="Hidden", compute="_compute_data",
        search="_search_hidden")

    # Primary Value
    primary_function = fields.Selection(
        string="Primary Function", required=True,
        selection=FIELD_FUNCTION_SELECTION,  default="count",
    )

    primary_field_id = fields.Many2one(
        comodel_name="ir.model.fields",
        string="Primary Field",
        domain="[('model_id', '=', model_id),"
        " ('ttype', 'in', ['float', 'integer', 'monetary'])]",
    )

    primary_format = fields.Char(
        string="Primary Format",
        help="Python Format String valid with str.format()\n"
        "ie: '{:,} Kgs' will output '1,000 Kgs' if value is 1000.",
    )

    primary_value = fields.Float(
        string="Primary Value", compute="_compute_data")

    primary_formated_value = fields.Char(
        string="Primary Formated Value", compute="_compute_data")

    primary_helper = fields.Char(
        string="Primary Helper", compute="_compute_helper",
        store=True)

    # Secondary Value
    secondary_function = fields.Selection(
        string="Secondary Function", selection=FIELD_FUNCTION_SELECTION,
    )

    secondary_field_id = fields.Many2one(
        comodel_name="ir.model.fields",
        string="Secondary Field",
        domain="[('model_id', '=', model_id),"
        " ('ttype', 'in', ['float', 'integer', 'monetary'])]",
    )

    secondary_format = fields.Char(
        string="Secondary Format",
        help="Python Format String valid with str.format()\n"
        "ie: '{:,} Kgs' will output '1,000 Kgs' if value is 1000.",
    )

    secondary_value = fields.Float(
        string="Secondary Value", compute="_compute_data")

    secondary_formated_value = fields.Char(
        string="Secondary Formated Value", compute="_compute_data"
    )

    secondary_helper = fields.Char(
        string="Secondary Helper", compute="_compute_helper",
        store=True
    )

    error = fields.Char(string="Error Details", compute="_compute_data")

    # Compute Section
    @api.depends("primary_format", "secondary_format", "model_id", "domain")
    def _compute_data(self):
        for tile in self:
            if not tile.model_id or not tile.active:
                return
            model = self.env[tile.model_id.model]
            eval_context = self._get_eval_context()
            domain = tile.domain or "[]"
            try:
                count = model.search_count(eval(domain, eval_context))
            except Exception as e:
                tile.primary_value = 0.0
                tile.primary_formated_value =\
                    tile.secondary_formated_value = _("Error")
                tile.error = str(e)
                return
            fields = [
                f.name
                for f in [tile.primary_field_id, tile.secondary_field_id]
                if f
            ]
            read_vals = (
                fields
                and model.search_read(eval(domain, eval_context), fields)
                or []
            )
            for f in ["primary_", "secondary_"]:
                f_function = f + "function"
                f_field_id = f + "field_id"
                f_format = f + "format"
                f_value = f + "value"
                f_formated_value = f + "formated_value"
                value = 0
                if not tile[f_function]:
                    tile[f_value] = 0.0
                    tile[f_formated_value] = False
                else:
                    if tile[f_function] == "count":
                        value = count
                    else:
                        func = FIELD_FUNCTIONS[tile[f_function]]["func"]
                        vals = [x[tile[f_field_id].name] for x in read_vals]
                        value = func(vals or [0.0])
                    try:
                        tile[f_value] = value
                        tile[f_formated_value] = (
                            tile[f_format] or "{:,}").format(value)
                        if tile.hide_if_null and not value:
                            tile.hidden = True
                    except ValueError as e:
                        tile[f_value] = 0.0
                        tile[f_formated_value] = _("Error")
                        tile.error = str(e)

    @api.depends(
        "primary_function",
        "primary_field_id",
        "secondary_function",
        "secondary_field_id",
    )
    def _compute_helper(self):
        for tile in self:
            for f in ["primary_", "secondary_"]:
                f_function = f + "function"
                f_field_id = f + "field_id"
                f_helper = f + "helper"
                tile[f_helper] = ""
                field_func = FIELD_FUNCTIONS.get(tile[f_function], {})
                help = field_func.get("help", False)
                if help:
                    if tile[f_function] != "count" and tile[f_field_id]:
                        desc = tile[f_field_id].field_description
                        tile[f_helper] = help % desc
                    else:
                        tile[f_helper] = help

    def _compute_active(self):
        ima = self.env["ir.model.access"]
        for tile in self:
            if tile.model_id:
                tile.active = ima.check(tile.model_id.model, "read", False)
            else:
                tile.active = True

    # Search Sections
    def _search_hidden(self, operator, operand):
        items = self.search([])
        hidden_tile_ids = [x.id for x in items if x.hidden]
        if (operator == "=" and operand is False) or\
                (operator == "!=" and operand is True):
            domain = [("id", "not in", hidden_tile_ids)]
        else:
            domain = [("id", "in", hidden_tile_ids)]
        return domain

    def _search_active(self, operator, value):
        cr = self.env.cr
        if operator != "=":
            raise except_orm(
                _("Unimplemented Feature. Search on Active field disabled.")
            )
        ima = self.env["ir.model.access"]
        ids = []
        cr.execute(
            """
            SELECT tt.id, im.model
            FROM tile_tile tt
            INNER JOIN ir_model im
                ON tt.model_id = im.id"""
        )
        for result in cr.fetchall():
            if ima.check(result[1], "read", False) == value:
                ids.append(result[0])
        return [("id", "in", ids)]

    # Constraints Sections
    @api.constrains("model_id", "primary_field_id", "secondary_field_id")
    def _check_model_id_field_id(self):
        for rec in self:
            if any(
                [
                    rec.primary_field_id
                    and rec.primary_field_id.model_id.id != rec.model_id.id,
                    rec.secondary_field_id
                    and rec.secondary_field_id.model_id.id != rec.model_id.id,
                ]
            ):
                raise ValidationError(
                    _("Please select a field from the selected model.")
                )

    # Onchange Sections
    @api.onchange("model_id")
    def _onchange_model_id(self):
        self.primary_field_id = False
        self.secondary_field_id = False
        self.action_id = False

    @api.onchange("primary_function", "secondary_function")
    def _onchange_function(self):
        if self.primary_function in [False, "count"]:
            self.primary_field_id = False
        if self.secondary_function in [False, "count"]:
            self.secondary_field_id = False

    # Action methods
    @api.multi
    def open_link(self):
        if self.action_id:
            action = self.action_id.read()[0]
        else:
            action = {
                "view_type": "form",
                "view_mode": "tree",
                "view_id": False,
                "res_model": self.model_id.model,
                "type": "ir.actions.act_window",
                "target": "current",
                "domain": self.domain,
            }
        action.update({
            "name": self.name,
            "display_name": self.name,
            "context": dict(self.env.context, group_by=False),
            "domain": self.domain,
        })
        return action

    @api.model
    def add(self, vals):
        if "model_id" in vals and not vals["model_id"].isdigit():
            # need to replace model_name with its id
            vals["model_id"] = (
                self.env["ir.model"]
                .search([("model", "=", vals["model_id"])])
                .id
            )
        self.create(vals)

    @api.model
    def _get_eval_context(self):
        def _context_today():
            return fields.Date.from_string(fields.Date.context_today(self))

        context = self.env.context.copy()
        context.update(
            {
                "time": time,
                "datetime": datetime,
                "relativedelta": relativedelta,
                "context_today": _context_today,
                "current_date": fields.Date.today(),
            }
        )
        return context
