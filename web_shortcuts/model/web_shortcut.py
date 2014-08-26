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


class web_shortcut(orm.Model):
    _name = 'web.shortcut'
    _columns = {
        'name': fields.char('Shortcut Name', size=64),
        'menu_id': fields.many2one('ir.ui.menu'),
        'user_id': fields.many2one('res.users', 'User Ref.', required=True,
                                   ondelete='cascade', select=True),
    }

    def get_user_shortcuts(self, cr, uid, user_id, context=None):
        ids = self.search(cr, uid, [('user_id', '=', user_id)],
                          context=context)
        results = self.read(cr, uid, ids, ['menu_id'], context=context)
        name_map = dict(self.pool.get('ir.ui.menu')
                        .name_get(cr, uid, [x['menu_id'][0] for x in results],
                                  context=context))
        # Make sure to return only shortcuts pointing to exisintg menu items.
        filtered_results = filter(lambda result: result['menu_id'][0] in
                                  name_map, results)
        for result in filtered_results:
            result.update(name=name_map[result['menu_id'][0]])
        return filtered_results

    _order = 'name'
    _defaults = {
        'user_id': lambda obj, cr, uid, context: uid,
    }
    _sql_constraints = [
        ('shortcut_unique', 'unique(menu_id,user_id)',
         'Shortcut for this menu already exists!'),
    ]

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
