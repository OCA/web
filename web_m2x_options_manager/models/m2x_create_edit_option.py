# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.tools.cache import ormcache
from odoo.tools.safe_eval import safe_eval


class M2xCreateEditOption(models.Model):
    """Technical model to define M2X option at single field level.

    Each record is uniquely defined by its ``field_id``.
    """

    _name = "m2x.create.edit.option"
    _description = "Field 'Create & Edit' Options"

    name = fields.Char(compute="_compute_name", store=True)
    field_id = fields.Many2one(
        "ir.model.fields",
        domain=[("can_have_options", "=", True)],
        ondelete="cascade",
        required=True,
        index=True,
        string="Field",
    )
    field_name = fields.Char(
        related="field_id.name",
        store=True,
    )
    model_id = fields.Many2one(
        "ir.model",
        related="field_id.model_id",
        store=True,
        string="Model",
    )
    model_name = fields.Char(
        related="field_id.model",
        store=True,
    )
    comodel_id = fields.Many2one(
        "ir.model",
        related="field_id.comodel_id",
        store=True,
        string="Comodel",
    )
    comodel_name = fields.Char(
        related="field_id.relation",
        store=True,
        string="Comodel Name",
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
            "field_uniqueness",
            "unique(field_id)",
            "Options must be unique for each field!",
        ),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        # Clear cache to avoid misbehavior from cached methods
        self._clear_caches()
        return super().create(vals_list)

    def write(self, vals):
        # Clear cache to avoid misbehavior from cached methods
        if set(vals).intersection(["field_id"] + self._get_option_fields()):
            self._clear_caches()
        return super().write(vals)

    def unlink(self):
        # Clear cache to avoid misbehavior from cached methods
        self._clear_caches()
        return super().unlink()

    def _clear_caches(self, *cache_names):
        """Clear registry caches

        By default, clears caches to avoid misbehavior from cached methods:
            - ``m2x.create.edit.option._get_id()``
            - ``ir.ui.view._get_view_cache()``
        """
        self.env.registry.clear_cache(*self._clear_caches_get_names(*cache_names))

    def _clear_caches_get_names(self, *cache_names) -> list[str]:
        """Retrieves registry caches names for clearance

        By default, we want to clear caches:
            - "default": where ``m2x.create.edit.option._get_id()`` results get stored
            - "templates": where ``ir.ui.view._get_view_cache()`` results get stored
        """
        return list(cache_names) + ["default", "templates"]

    @api.depends("field_id")
    def _compute_name(self):
        for opt in self:
            try:
                opt.name = str(self.env[opt.field_id.model]._fields[opt.field_id.name])
            except KeyError:
                opt.name = "Invalid field"

    @api.constrains("field_id")
    def _check_field_can_have_options(self):
        for opt in self:
            if opt.field_id and not opt.field_id.can_have_options:
                raise ValidationError(
                    _(
                        "Field %(field)s cannot have M2X options",
                        field=opt.field_id.display_name,
                    )
                )

    def _apply_options(self, node):
        """Applies options ``self`` to ``node``

        :param etree._Element node: view ``<field/>`` node to update
        :rtype: None
        """
        self.ensure_one()
        node_options = self._read_node_options(node)
        for key, (mode, value) in self._read_own_options().items():
            if mode == "force" or key not in node_options:
                node_options[key] = value
        node.set("options", str(node_options))

    def _read_node_options(self, node):
        """Helper method to read "options" attribute on ``node``

        :param etree._Element node: view ``<field/>`` node to parse
        :rtype: dict[str, Any]
        """
        self.ensure_one()
        options = node.attrib.get("options") or {}
        if isinstance(options, str):
            options = safe_eval(options, self._get_node_options_eval_context()) or {}
        return dict(options)

    def _get_node_options_eval_context(self):
        """Helper method to get eval context to read "options" attribute from a node

        :rtype: dict
        """
        self.ensure_one()
        eval_ctx = dict(self.env.context or [])
        eval_ctx.update({"context": dict(eval_ctx)})
        return eval_ctx

    def _read_own_options(self):
        """Helper method to retrieve M2X options from ``self``

        :return: a dictionary mapping each M2X option to its mode and value, eg:
            {'create': ('force', 'true'), 'create_edit': ('set', 'false')}
        :rtype: dict[str, tuple[str, Any]]
        """
        self.ensure_one()
        res = {}
        for fname, fvalue in self.read(self._get_option_fields())[0].items():
            if fname != "id" and fvalue != "none":
                mode, value = tuple(fvalue.split("_"))
                res[fname.replace("option_", "")] = (mode, value == "true")
        return res

    def _get_option_fields(self):
        """Helper method to retrieve field names to parse as M2X options

        :return: list of field names to parse as M2X options
        :rtype: list[str]
        """
        return ["option_create", "option_create_edit"]

    @api.model
    def get(self, model_name, field_name):
        """Returns specific record for ``field_name`` in ``model_name``

        :param str model_name: technical model name (i.e. "sale.order")
        :param str field_name: technical field name (i.e. "partner_id")
        :return: a ``m2x.create.edit.option`` record
        :rtype: M2xCreateEditOption
        """
        return self.browse(self._get_id(model_name, field_name))

    @api.model
    @ormcache("model_name", "field_name", cache="default")
    def _get_id(self, model_name, field_name):
        """Inner implementation of ``get``.

        An ID is returned to allow caching (see :class:`ormcache`); :meth:`get`
        will then convert it to a proper record.

        :param str model_name: technical model name (i.e. "sale.order")
        :param str field_name: technical field name (i.e. "partner_id")
        :return: a ``m2x.create.edit.option`` record ID
        :rtype: int
        """
        opt_id = 0
        field = self.env["ir.model.fields"]._get(model_name, field_name)
        if field:
            # SQL constraint grants record uniqueness (if existing)
            opt = self.search([("field_id", "=", field.id)], limit=1)
            if opt:
                opt_id = opt.id
        return opt_id
