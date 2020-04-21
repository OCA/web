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
        domain=['|', ('active', '=', False), ('active', '=', True)],
    )
    complement_filter_ids = fields.Many2many(
        'ir.filters', 'ir_filters_complement_rel', 'left_filter_id',
        'right_filter_id', 'Remove result of filters',
        domain=['|', ('active', '=', False), ('active', '=', True)],
    )
    domain = fields.Text(compute='_compute_domain', inverse='_inverse_domain')
    domain_this = fields.Text('This filter\'s own domain', oldname='domain')
    evaluate_before_negate = fields.Boolean(
        'Evaluate this filter before negating',
        compute='_compute_flags',
        help='This is necessary if this filter contains positive operators'
        'on x2many fields',
    )
    evaluate_always = fields.Boolean(
        'Always evaluate this filter before using it',
        compute='_compute_flags',
        help='This is necessary if this filter contains x2many fields with'
        '_auto_join activated',
    )
    save_as_public = fields.Boolean(
        'Share with all users', default=False,
        compute=lambda self: None, inverse=lambda self: None,
    )

    @api.multi
    @api.depends('domain')
    def _compute_is_frozen(self):
        '''determine if this is fixed list of ids'''
        for this in self:
            try:
                domain = safe_eval(this.domain)
            except (SyntaxError, TypeError, ValueError, NameError):
                domain = [expression.FALSE_LEAF]
            this.is_frozen = (
                len(domain) == 1 and
                expression.is_leaf(domain[0]) and
                domain[0][0] == 'id'
            )

    @api.multi
    @api.depends(
        'domain_this', 'union_filter_ids.domain',
        'complement_filter_ids.domain',
    )
    def _compute_domain(self):
        '''combine our domain with all domains to union/complement,
        this works recursively'''
        def eval_n(domain):
            '''parse a domain and normalize it'''
            try:
                domain = safe_eval(domain)
            except (SyntaxError, TypeError, ValueError, NameError):
                domain = [expression.FALSE_LEAF]
            return expression.normalize_domain(
                domain or [expression.FALSE_LEAF])

        for this in self:
            if this.model_id not in self.env:
                this.domain = '[]'
                _logger.error('Unknown model %s used in filter', this.model_id)
                continue
            domain = eval_n(this.domain_this)
            for u in this.union_filter_ids:
                if u.evaluate_always:
                    matching_ids = self.env[u.model_id].search(
                        eval_n(u.domain),
                    ).ids
                    domain = expression.OR([
                        domain,
                        [('id', 'in', matching_ids)],
                    ])
                else:
                    domain = expression.OR([domain, eval_n(u.domain)])
            for c in this.complement_filter_ids:
                if c.evaluate_before_negate:
                    matching_ids = self.env[c.model_id].search(
                        eval_n(c.domain),
                    ).ids
                    domain = expression.AND([
                        domain,
                        [('id', 'not in', matching_ids)],
                    ])
                else:
                    domain = expression.AND([
                        domain,
                        ['!'] + eval_n(c['domain']),
                    ])
            this.domain = str(expression.normalize_domain(domain))

    @api.multi
    def _inverse_domain(self):
        for this in self:
            this.domain_this = this.domain

    @api.multi
    @api.depends('domain')
    def _compute_flags(self):
        """check if this filter contains references to x2many fields. If so,
        then negation goes wrong in nearly all cases, so we evaluate the
        filter and remove its resulting ids"""
        for this in self:
            this.evaluate_before_negate = False
            this.evaluate_always = False
            domain = expression.normalize_domain(
                safe_eval(this.domain or 'False') or [expression.FALSE_LEAF]
            )
            for arg in domain:
                current_model = self.env.get(this.model_id)
                if current_model is None:
                    _logger.error(
                        'Unknown model %s used in filter', this.model_id)
                    continue
                if not expression.is_leaf(arg) or not isinstance(arg[0], str):
                    continue
                has_x2many = False
                has_auto_join = False
                for field_name in arg[0].split('.'):
                    if field_name in models.MAGIC_COLUMNS:
                        continue
                    field = current_model._fields[field_name]
                    has_x2many |= field.type in self._evaluate_before_negate
                    has_x2many |= bool(field.compute)
                    has_auto_join |= getattr(field, 'auto_join', False)
                    has_auto_join |= bool(field.compute)
                    if field.comodel_name:
                        current_model = self.env.get(field.comodel_name)
                    if current_model is None or has_x2many and has_auto_join:
                        break
                this.evaluate_before_negate |= has_x2many
                this.evaluate_always |= has_auto_join
                if this.evaluate_before_negate and this.evaluate_always:
                    break

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
        return self.env[self.model_id].with_context(
            safe_eval(self.context)
        ).search(safe_eval(self.domain))

    @api.multi
    def button_save(self):
        return {'type': 'ir.actions.act_window_close'}

    @api.multi
    def button_freeze(self):
        '''evaluate the filter and write a fixed [('id', 'in', [])] domain'''
        for this in self:
            ids = this._evaluate().ids
            removed_filters = \
                this.union_filter_ids + this.complement_filter_ids
            this.write({
                'domain': str([('id', 'in', ids)]),
                'union_filter_ids': [(6, 0, [])],
                'complement_filter_ids': [(6, 0, [])],
            })
            # if we removed inactive filters which are orphaned now, delete
            # them
            if removed_filters:
                self.env.cr.execute(
                    '''delete from ir_filters
                    where
                    not active and id in %s
                    and not exists (select right_filter_id
                    from ir_filters_union_rel where left_filter_id=id)
                    and not exists (select right_filter_id
                    from ir_filters_complement_rel where
                    left_filter_id=id)''',
                    (tuple(removed_filters.ids),)
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
