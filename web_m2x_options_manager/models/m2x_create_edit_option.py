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
    )
    field_name = fields.Char(related="field_id.name", store=True)
    model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        required=True,
    )
    model_name = fields.Char(
        compute="_compute_model_name",
        inverse="_inverse_model_name",
        store=True,
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

    _sql_constraints = [
        (
            "model_field_uniqueness",
            "unique(field_id,model_id)",
            "Options must be unique for each model/field couple!",
        ),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        self._clear_caches()
        return super().create(vals_list)

    def write(self, vals):
        self._clear_caches()
        return super().write(vals)

    def unlink(self):
        self._clear_caches()
        return super().unlink()

    def _clear_caches(self, *cache_names):
        """Clear registry caches

        By default, clears caches to avoid misbehavior from cached methods:
            - ``m2x.create.edit.option._get()``
            - ``ir.ui.view._get_view_cache()``
        """
        self.env.registry.clear_cache(*self._clear_caches_get_names(*cache_names))

    def _clear_caches_get_names(self, *cache_names) -> list[str]:
        """Retrieves registry caches names for clearance

        By default, we want to clear caches:
            - "default": where ``m2x.create.edit.option._get()`` results get stored
            - "templates": where ``ir.ui.view._get_view_cache()`` results get stored
        """
        return list(cache_names) + ["default", "templates"]

    @api.depends("model_id")
    def _compute_model_name(self):
        for opt in self:
            opt.model_name = opt.model_id.model

    def _inverse_model_name(self):
        getter = self.env["ir.model"]._get
        for model_name, opts in self.grouped("model_name").items():
            if model := getter(model_name):
                opts.model_id = model
            else:
                raise ValidationError(
                    _("Invalid model name: '%(model_name)s'", model_name=model_name)
                )

    @api.constrains("model_id", "field_id")
    def _check_field_in_model(self):
        for opt in self:
            if opt.field_id.model_id != opt.model_id:
                raise ValidationError(
                    _(
                        "'%(fname)s' is not a valid field for model '%(mname)s'!",
                        fname=opt.field_name,
                        mname=opt.model_name,
                    )
                )

    @api.constrains("field_id")
    def _check_field_type(self):
        if any(f.ttype not in ("many2many", "many2one") for f in self.field_id):
            raise ValidationError(
                _("Only Many2many and Many2one fields can be chosen!")
            )

    def _apply_options(self, node):
        """Applies option ``self`` to ``node``"""
        self.ensure_one()
        options = node.attrib.get("options") or {}
        if isinstance(options, str):
            options = safe_eval(options, dict(self.env.context or [])) or {}
        for key in ("create", "create_edit"):
            if (opt := self[f"option_{key}"]) != "none":
                mode, val = opt.split("_")
                if mode == "force" or key not in options:
                    options[key] = val == "true"
        node.set("options", str(options))

    @api.model
    def get(self, model_name, field_name):
        """Returns specific record for ``field_name`` in ``model_name``

        :param str model_name: technical model name (i.e. "sale.order")
        :param str field_name: technical field name (i.e. "partner_id")
        :returns: the ``m2x.create.edit.option`` record for the given model/field couple
        :rtype: M2xCreateEditOption
        """
        return self.browse(self._get(model_name, field_name))

    @api.model
    @ormcache("model_name", "field_name", cache="default")
    def _get(self, model_name, field_name):
        """Inner implementation of ``get``.

        An ID is returned to allow caching (see :class:``ormcache``); :meth:``get``
        will then convert it to a proper record.

        :param str model_name: technical model name (i.e. "sale.order")
        :param str field_name: technical field name (i.e. "partner_id")
        :returns: the ``m2x.create.edit.option`` ID for the given model/field couple,
            or None if there's no match
        :rtype: int|None
        """
        dom = [("model_name", "=", model_name), ("field_name", "=", field_name)]
        # ``_check_field_model_uniqueness()`` grants uniqueness if existing
        return self.search(dom, limit=1).id or None
