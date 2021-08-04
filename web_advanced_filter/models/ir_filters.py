# Copyright 2014-2020 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
import logging
from odoo import _, api, fields, models
from odoo.tools.safe_eval import safe_eval
from odoo.osv import expression


_logger = logging.getLogger(__name__)


class IrFilters(models.Model):
    _inherit = 'ir.filters'
    _evaluate_before_negate = ['one2many', 'many2many']

    is_frozen = fields.Boolean('Frozen', compute='_compute_is_frozen')
    union_filter_ids = fields.Many2many(
        'ir.filters', 'ir_filters_union_rel', 'left_filter_id',
        'right_filter_id', 'Add result of filters',
        context={"active_test": False},
    )
    complement_filter_ids = fields.Many2many(
        'ir.filters', 'ir_filters_complement_rel', 'left_filter_id',
        'right_filter_id', 'Remove result of filters',
        context={"active_test": False},
    )
    domain = fields.Text(compute='_compute_domain', inverse='_inverse_domain')
    domain_this = fields.Text("Domain without helpers", oldname='domain')
    evaluate_before_negate = fields.Boolean(
        'Evaluate this filter before negating',
        compute='_compute_pre_evaluate',
        help='This is necessary if this filter contains positive operators'
        'on x2many fields',
    )
    evaluate_before_join = fields.Boolean(
        'Evaluate this filter before joining',
        compute='_compute_pre_evaluate',
        help='This is necessary if this filter contains x2many fields with'
        '_auto_join activated',
    )
    save_as_public = fields.Boolean(
        'Share with all users', default=False, store=False
    )

    @api.model
    def _eval_domain(self, domain):
        """Parse a domain and normalize it, with a default if it's invalid."""
        try:
            domain = safe_eval(domain) or [expression.FALSE_LEAF]
        except (SyntaxError, TypeError, ValueError, NameError):
            domain = [expression.FALSE_LEAF]
        return expression.normalize_domain(domain)

    @api.multi
    @api.depends('domain')
    def _compute_is_frozen(self):
        '''determine if this is fixed list of ids'''
        for this in self:
            domain = self._eval_domain(this.domain)
            this.is_frozen = (
                len(domain) == 1
                and expression.is_leaf(domain[0])
                and domain[0][0] == "id"
                and domain[0][1] == "in"
            )

    @api.multi
    @api.depends(
        # Morally, this should have union_filter_ids.domain and
        # complement_filter_ids.domain. But that causes the domain to be
        # invalidated much too often, sometimes giving an enormous slowdown.
        # This comment was added in version 12. It should be reinvestigated
        # when migrating to a higher version.
        'domain_this', 'union_filter_ids', 'complement_filter_ids',
    )
    def _compute_domain(self):
        '''combine our domain with all domains to union/complement,
        this works recursively'''

        for this in self:
            if this.model_id not in self.env:
                this.domain = '[]'
                _logger.error(
                    "Unknown model %s used in filter %d",
                    this.model_id,
                    this.id,
                )
                continue
            domain = self._eval_domain(this.domain_this)
            for u in this.union_filter_ids:
                if u.model_id != this.model_id:
                    _logger.warning(
                        "Model mismatch in helper %d on filter %d!",
                        u.model_id,
                        this.model_id,
                    )
                    continue
                if u.evaluate_before_join:
                    matching_ids = (
                        self.env[this.model_id]
                        .search(self._eval_domain(u.domain))
                        .ids
                    )
                    domain = expression.OR([
                        domain,
                        [('id', 'in', matching_ids)],
                    ])
                else:
                    domain = expression.OR(
                        [domain, self._eval_domain(u.domain)]
                    )
            for c in this.complement_filter_ids:
                if c.model_id != this.model_id:
                    _logger.warning(
                        "Model mismatch in helper %d on filter %d!",
                        c.model_id,
                        this.model_id,
                    )
                    continue
                if c.evaluate_before_negate:
                    matching_ids = (
                        self.env[this.model_id]
                        .search(self._eval_domain(c.domain))
                        .ids
                    )
                    domain = expression.AND([
                        domain,
                        [('id', 'not in', matching_ids)],
                    ])
                else:
                    domain = expression.AND([
                        domain,
                        ["!"] + self._eval_domain(c["domain"])
                    ])
            this.domain = repr(expression.normalize_domain(domain))

    @api.multi
    def _inverse_domain(self):
        for this in self:
            this.domain_this = this.domain

    @api.multi
    @api.depends('domain', 'model_id')
    def _compute_pre_evaluate(self):
        """Check if this filter contains problematic fields.

        Domains with certain fields can't be negated or joined properly.
        They have to be evaluated in advance. In particular:

        - Negating a query on a 2many field doesn't invert the matched records.
          ``foo.bar != 3`` will yield all records with a ``foo.bar`` that
          isn't ``3``, not all records without a ``foo.bar`` that is ``3``.
          So just putting a ``!`` in front of the domain doesn't do what we
          want.

        - Querying an autojoined field constrains the entire search, even if
          it's joined with ``|``. If ``('user_ids.login', '=', 'admin')`` is
          used anywhere in the domain then only records that satisfy that leaf
          are found.

        - Fields with custom search logic (``search=...``) might do one of the
          above, or some other strange thing.

        Examples can be found in the tests for this module.
        """
        for this in self:
            evaluate_before_negate = False
            evaluate_before_join = False
            domain = self._eval_domain(this.domain)
            for arg in domain:
                if not expression.is_leaf(arg) or not isinstance(arg[0], str):
                    continue
                current_model = self.env.get(this.model_id)
                if current_model is None:
                    _logger.error(
                        "Unknown model %s used in filter %d",
                        this.model_id,
                        this.id,
                    )
                    continue
                for field_name in arg[0].split('.'):
                    if field_name in models.MAGIC_COLUMNS:
                        continue
                    field = current_model._fields[field_name]
                    evaluate_before_negate = (
                        evaluate_before_negate
                        or field.search
                        or field.type in self._evaluate_before_negate
                        or getattr(field, "auto_join", False)
                    )
                    evaluate_before_join = (
                        evaluate_before_join
                        or field.search
                        or getattr(field, "auto_join", False)
                    )
                    if field.comodel_name:
                        current_model = self.env.get(field.comodel_name)
                    if current_model is None or (
                        evaluate_before_negate and evaluate_before_join
                    ):
                        break
                if evaluate_before_negate and evaluate_before_join:
                    break
            this.evaluate_before_negate = evaluate_before_negate
            this.evaluate_before_join = evaluate_before_join

    @api.model_create_multi
    def create(self, vals_list):
        for values in vals_list:
            values.setdefault(
                'user_id',
                False if values.get('save_as_public') else self.env.user.id,
            )
        return super(IrFilters, self).create(vals_list)

    @api.multi
    def _evaluate(self):
        self.ensure_one()
        return (
            self.env[self.model_id]
            .with_context(**safe_eval(self.context))
            .search(safe_eval(self.domain))
        )

    @api.multi
    def button_save(self):
        return {'type': 'ir.actions.act_window_close'}

    @api.multi
    def button_freeze(self):
        '''evaluate the filter and write a fixed [('id', 'in', [])] domain'''
        for this in self:
            ids = this._evaluate().ids
            this.write({
                'domain': repr([('id', 'in', ids)]),
                'union_filter_ids': [(6, 0, [])],
                'complement_filter_ids': [(6, 0, [])],
            })

    @api.multi
    def write(self, vals):
        if not ("union_filter_ids" in vals or "complement_filter_ids" in vals):
            return super().write(vals)
        old = self.mapped("union_filter_ids") | self.mapped(
            "complement_filter_ids"
        )
        res = super().write(vals)
        new = self.mapped("union_filter_ids") | self.mapped(
            "complement_filter_ids"
        )
        (old - new)._garbage_collect_helpers()
        return res

    @api.multi
    def unlink(self):
        helpers = self.mapped("union_filter_ids") | self.mapped(
            "complement_filter_ids"
        )
        res = super().unlink()
        helpers._garbage_collect_helpers()
        return res

    @api.multi
    def _garbage_collect_helpers(self):
        """Remove filters that have been made obsolete.

        This method should only be called on filters that are/were in some
        other filter's union_filter_ids or complement_filter_ids.

        Filters are removed if they're not active and no longer used.
        """
        if not self:
            return
        self.env.cr.execute(
            """DELETE FROM ir_filters
            WHERE NOT active AND id IN %s
            AND NOT EXISTS (
                SELECT left_filter_id FROM ir_filters_union_rel
                WHERE right_filter_id = id
            )
            AND NOT EXISTS (
                SELECT left_filter_id FROM ir_filters_complement_rel
                WHERE right_filter_id = id
            )""",
            (tuple(self.ids),),
        )

    @api.multi
    def button_test(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Testing %s') % self.name,
            'res_model': self.model_id,
            'domain': self.domain,
            'view_type': 'form',
            'view_mode': 'tree,form',
            'context': {
                'default_filter_id': self.id,
            },
        }
