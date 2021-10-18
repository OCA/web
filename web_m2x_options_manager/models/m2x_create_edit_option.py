# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.tools.cache import ormcache
from odoo.tools.safe_eval import safe_eval


class M2xCreateEditOption(models.Model):
    _name = "m2x.create.edit.option"
    _description = "Manage Options 'Create/Edit' For Fields"

    field_id = fields.Many2one(
        "ir.model.fields",
        domain=[("ttype", "in", ("many2many", "many2one"))],
        ondelete="cascade",
        required=True,
        string="Field",
    )

    field_name = fields.Char(
        related="field_id.name",
        store=True,
        string="Field Name",
    )

    model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        required=True,
        string="Model",
    )

    model_name = fields.Char(
        compute="_compute_model_name",
        inverse="_inverse_model_name",
        store=True,
        string="Model Name",
    )

    option_create = fields.Selection(
        [
            ("none", "Do nothing"),
            ("set_true", "Add"),
            ("force_true", "Force Add"),
            ("set_false", "Remove"),
            ("force_false", "Force Remove"),
        ],
        default="set_false",
        help="Defines behaviour for 'Create' option:\n"
        "* Do nothing: nothing is done\n"
        "* Add/Remove: option 'Create' is set to True/False only if not"
        " already present in view definition\n"
        "* Force Add/Remove: option 'Create' is always set to True/False,"
        " overriding any pre-existing option",
        required=True,
        string="Create Option",
    )

    option_create_edit = fields.Selection(
        [
            ("none", "Do nothing"),
            ("set_true", "Add"),
            ("force_true", "Force Add"),
            ("set_false", "Remove"),
            ("force_false", "Force Remove"),
        ],
        default="set_false",
        help="Defines behaviour for 'Create & Edit' option:\n"
        "* Do nothing: nothing is done\n"
        "* Add/Remove: option 'Create & Edit' is set to True/False only if not"
        " already present in view definition\n"
        "* Force Add/Remove: option 'Create & Edit' is always set to"
        " True/False, overriding any pre-existing option",
        required=True,
        string="Create & Edit Option",
    )

    option_create_edit_wizard = fields.Boolean(
        default=True,
        help="Defines behaviour for 'Create & Edit' Wizard\n"
        "Set to False to prevent 'Create & Edit' Wizard to pop up",
        string="Create & Edit Wizard",
    )

    _sql_constraints = [
        (
            "model_field_uniqueness",
            "unique(field_id,model_id)",
            "Options must be unique for each model/field couple!",
        ),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        # Clear cache to avoid misbehavior from cached :meth:`_get()`
        type(self)._get.clear_cache(self.browse())
        return super().create(vals_list)

    def write(self, vals):
        # Clear cache to avoid misbehavior from cached :meth:`_get()`
        type(self)._get.clear_cache(self.browse())
        return super().write(vals)

    def unlink(self):
        # Clear cache to avoid misbehavior from cached :meth:`_get()`
        type(self)._get.clear_cache(self.browse())
        return super().unlink()

    @api.depends("model_id")
    def _compute_model_name(self):
        for opt in self:
            opt.model_name = opt.model_id.model

    def _inverse_model_name(self):
        getter = self.env["ir.model"]._get
        for opt in self:
            # This also works as a constrain: if ``model_name`` is not a
            # valid model name, then ``model_id`` will be emptied, but it's
            # a required field!
            opt.model_id = getter(opt.model_name)

    @api.constrains("model_id", "field_id")
    def _check_field_in_model(self):
        for opt in self:
            if opt.field_id.model_id != opt.model_id:
                msg = _("'%s' is not a valid field for model '%s'!")
                raise ValidationError(msg % (opt.field_name, opt.model_name))

    @api.constrains("field_id")
    def _check_field_type(self):
        ttypes = ("many2many", "many2one")
        if any(o.field_id.ttype not in ttypes for o in self):
            msg = _("Only Many2many and Many2one fields can be chosen!")
            raise ValidationError(msg)

    def _apply_options(self, node):
        """Applies options ``self`` to ``node``"""
        self.ensure_one()
        options = node.attrib.get("options") or {}
        if isinstance(options, str):
            options = safe_eval(options, dict(self.env.context or [])) or {}
        for k in ("create", "create_edit"):
            opt = self["option_%s" % k]
            if opt == "none":
                continue
            mode, val = opt.split("_")
            if mode == "force" or k not in options:
                options[k] = val == "true"
        node.set("options", str(options))
        if not self.option_create_edit_wizard:
            node.set("can_create", "false")
            node.set("can_write", "false")

    @api.model
    def get(self, model_name, field_name):
        """Returns specific record for ``field_name`` in ``model_name``

        :param str model_name: technical model name (i.e. "sale.order")
        :param str field_name: technical field name (i.e. "partner_id")
        """
        return self.browse(self._get(model_name, field_name))

    @api.model
    @ormcache("model_name", "field_name")
    def _get(self, model_name, field_name):
        """Inner implementation of ``get``.
        An ID is returned to allow caching (see :class:`ormcache`); :meth:`get`
        will then convert it to a proper record.

        :param str model_name: technical model name (i.e. "sale.order")
        :param str field_name: technical field name (i.e. "partner_id")
        """
        dom = [
            ("model_name", "=", model_name),
            ("field_name", "=", field_name),
        ]
        # `_check_field_model_uniqueness()` grants uniqueness if existing
        return self.search(dom, limit=1).id
