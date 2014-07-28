# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2014 Therp BV (<http://therp.nl>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
import itertools
from openerp.osv.orm import Model
from openerp.osv import fields, expression
from openerp.tools.safe_eval import safe_eval
from openerp.tools.translate import _


class IrFilters(Model):
    _inherit = 'ir.filters'

    def _is_frozen_get(self, cr, uid, ids, field_name, args, context=None):
        '''determine if this is fixed list of ids'''
        result = {}
        for this in self.browse(cr, uid, ids, context=context):
            domain = safe_eval(this.domain)
            result[this.id] = (len(domain) == 1 and
                               expression.is_leaf(domain[0]) and
                               domain[0][0] == 'id')
        return result

    def _domain_get(self, cr, uid, ids, field_name, args, context=None):
        '''combine our domain with all domains to union/complement,
        this works recursively'''
        def eval_n(domain):
            '''parse a domain and normalize it'''
            return expression.normalize_domain(
                safe_eval(domain) or [expression.FALSE_LEAF])
        result = {}
        for this in self.read(
                cr, uid, ids,
                ['domain_this', 'union_filter_ids', 'complement_filter_ids'],
                context=context):
            domain = eval_n(this['domain_this'])
            domain = expression.OR(
                [domain] +
                [eval_n(u['domain']) for u in self.read(
                    cr, uid, this['union_filter_ids'], ['domain'],
                    context=context)])
            for c in self.read(cr, uid, this['complement_filter_ids'],
                               ['domain'], context=context):
                domain = expression.AND([
                    domain,
                    ['!'] + eval_n(c['domain'])])
            result[this['id']] = str(domain)
        return result

    def _domain_set(self, cr, uid, ids, field_name, field_value, args,
                    context=None):
        self.write(cr, uid, ids, {'domain_this': field_value})

    _columns = {
        'is_frozen': fields.function(
            _is_frozen_get, type='boolean', string='Frozen'),
        'union_filter_ids': fields.many2many(
            'ir.filters', 'ir_filters_union_rel', 'left_filter_id',
            'right_filter_id', 'Add result of filters',
            domain=['|', ('active', '=', False), ('active', '=', True)]),
        'complement_filter_ids': fields.many2many(
            'ir.filters', 'ir_filters_complement_rel', 'left_filter_id',
            'right_filter_id', 'Remove result of filters',
            domain=['|', ('active', '=', False), ('active', '=', True)]),
        'active': fields.boolean('Active'),
        'domain': fields.function(
            _domain_get, type='text', string='Domain',
            fnct_inv=_domain_set),
        'domain_this': fields.text(
            'This filter\'s own domain', oldname='domain'),
    }

    _defaults = {
        'active': True,
    }

    def _evaluate(self, cr, uid, ids, context=None):
        assert len(ids) == 1
        this = self.browse(cr, uid, ids[0], context=context)
        return self.pool[this.model_id].search(
            cr, uid, safe_eval(this.domain), context=safe_eval(this.context))

    def button_save(self, cr, uid, ids, context=None):
        return {'type': 'ir.actions.act_window.close'}

    def button_freeze(self, cr, uid, ids, context=None):
        '''evaluate the filter and write a fixed [('ids', 'in', [])] domain'''
        for this in self.browse(cr, uid, ids, context=context):
            ids = this._evaluate()
            removed_filter_ids = [f.id for f in itertools.chain(
                this.union_filter_ids, this.complement_filter_ids)]
            this.write({
                'domain': str([('id', 'in', ids)]),
                'union_filter_ids': [(6, 0, [])],
                'complement_filter_ids': [(6, 0, [])],
            })
            # if we removed inactive filters which are orphaned now, delete
            # them
            cr.execute('''delete from ir_filters
                       where
                        not active and id in %s
                        and not exists (select right_filter_id
                            from ir_filters_union_rel where left_filter_id=id)
                        and not exists (select right_filter_id
                            from ir_filters_complement_rel where
                            left_filter_id=id)
                        ''',
                       (tuple(removed_filter_ids),))

    def button_test(self, cr, uid, ids, context=None):
        for this in self.browse(cr, uid, ids, context=None):
            return {
                'type': 'ir.actions.act_window',
                'name': _('Testing %s') % this.name,
                'res_model': this.model_id,
                'domain': this.domain,
                'view_type': 'form',
                'view_mode': 'tree',
                'context': {
                    'default_filter_id': this.id,
                },
            }

    def _auto_init(self, cr, context=None):
        cr.execute(
            'SELECT count(attname) FROM pg_attribute '
            'WHERE attrelid = '
            '( SELECT oid FROM pg_class WHERE relname = %s) '
            'AND attname = %s', (self._table, 'domain_this'))
        if not cr.fetchone()[0]:
            cr.execute(
                'ALTER table %s RENAME domain TO domain_this' % self._table)
        return super(IrFilters, self)._auto_init(cr, context=context)
