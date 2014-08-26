# -*- coding: utf-8 -*-
#
#
#    Authors: Adrien Peiffer
#    Copyright (c) 2014 Acsone SA/NV (http://www.acsone.eu)
#    All Rights Reserved
#
#    WARNING: This program as such is intended to be used by professional
#    programmers who take the whole responsibility of assessing all potential
#    consequences resulting from its eventual inadequacies and bugs.
#    End users who are looking for a ready-to-use solution with commercial
#    guarantees and support are strongly advised to contact a Free Software
#    Service Company.
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
#
from openerp.osv import orm, fields


class view_sc(orm.Model):
    _name = 'ir.ui.view_sc'
    _columns = {
        'name': fields.char('Shortcut Name', size=64), # Kept for backwards compatibility only - resource name used instead (translatable)
        'res_id': fields.integer('Resource Ref.', help="Reference of the target resource, whose model/table depends on the 'Resource Name' field."),
        'sequence': fields.integer('Sequence'),
        'user_id': fields.many2one('res.users', 'User Ref.', required=True, ondelete='cascade', select=True),
        'resource': fields.char('Resource Name', size=64, required=True, select=True)
    }

    def _auto_init(self, cr, context=None):
        super(view_sc, self)._auto_init(cr, context)
        cr.execute('SELECT indexname FROM pg_indexes WHERE indexname = \'ir_ui_view_sc_user_id_resource\'')
        if not cr.fetchone():
            cr.execute('CREATE INDEX ir_ui_view_sc_user_id_resource ON ir_ui_view_sc (user_id, resource)')

    def get_sc(self, cr, uid, user_id, model='ir.ui.menu', context=None):
        ids = self.search(cr, uid, [('user_id','=',user_id),('resource','=',model)], context=context)
        results = self.read(cr, uid, ids, ['res_id'], context=context)
        name_map = dict(self.pool.get(model).name_get(cr, uid, [x['res_id'] for x in results], context=context))
        # Make sure to return only shortcuts pointing to exisintg menu items.
        filtered_results = filter(lambda result: result['res_id'] in name_map, results)
        for result in filtered_results:
            result.update(name=name_map[result['res_id']])
        return filtered_results

    _order = 'sequence,name'
    _defaults = {
        'resource': 'ir.ui.menu',
        'user_id': lambda obj, cr, uid, context: uid,
    }
    _sql_constraints = [
        ('shortcut_unique', 'unique(res_id, resource, user_id)', 'Shortcut for this menu already exists!'),
    ]

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
