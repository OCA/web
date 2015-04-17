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
import time
import json
from openerp.osv.orm import TransientModel
from openerp.osv import fields, expression
from openerp.tools.safe_eval import safe_eval


class IrFiltersCombineWithExisting(TransientModel):
    _name = 'ir.filters.combine.with.existing'
    _description = 'Combine a selection with an existing filter'

    _columns = {
        'action': fields.selection(
            [('union', 'Union'), ('complement', 'Complement')],
            'Action', required=True),
        'domain': fields.char('Domain', required=True),
        'context': fields.char('Context', required=True),
        'model': fields.char('Model', required=True),
        'filter_id': fields.many2one('ir.filters', 'Filter', required=True),
    }

    def button_save(self, cr, uid, ids, context=None):
        assert len(ids) == 1
        this = self.browse(cr, uid, ids[0], context=context)
        domain = json.loads(this.domain)
        is_frozen = (len(domain) == 1 and
                     expression.is_leaf(domain[0]) and
                     domain[0][0] == 'id')

        if this.action == 'union':
            if is_frozen and this.filter_id.is_frozen:
                domain[0][2] = list(set(domain[0][2]).union(
                    set(safe_eval(this.filter_id.domain)[0][2])))
                this.filter_id.write({'domain': str(domain)})
            else:
                this.filter_id.write(
                    {
                        'union_filter_ids': [(0, 0, {
                            'name': '%s_%s_%d' % (
                                this.filter_id.name, 'add', time.time()),
                            'active': False,
                            'domain': str(domain),
                            'context': this.context,
                            'model_id': this.model,
                            'user_id': uid,
                        })],
                    })
        elif this.action == 'complement':
            if is_frozen and this.filter_id.is_frozen:
                complement_set = set(safe_eval(this.filter_id.domain)[0][2])
                domain[0][2] = list(
                    complement_set.difference(set(domain[0][2])))
                this.filter_id.write({'domain': str(domain)})
            else:
                this.filter_id.write(
                    {
                        'complement_filter_ids': [(0, 0, {
                            'name': '%s_%s_%d' % (
                                this.filter_id.name, 'remove', time.time()),
                            'active': False,
                            'domain': str(domain),
                            'context': this.context,
                            'model_id': this.model,
                            'user_id': uid,
                        })],
                    })

        return {'type': 'ir.actions.act_window.close'}
