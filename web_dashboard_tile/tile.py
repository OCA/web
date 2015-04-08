# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
#    Copyright (C) 2015-Today GRAP
#    Author Markus Schneider <markus.schneider at initos.com>
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
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

from openerp.osv import orm, fields
import random


class tile(orm.Model):
    _name = 'tile.tile'
    _order = 'sequence, name'

    def _get_tile_info(self, cr, uid, ids, fields, args, context=None):
        ima_obj = self.pool['ir.model.access']
        res = {}
        records = self.browse(cr, uid, ids, context=context)
        for r in records:
            if ima_obj.check(
                    cr, uid, r.model_id.model, 'read', False, context):
                model = self.pool.get(r.model_id.model)
                res[r.id] = {
                    'active': True,
                    'count': model.search_count(
                        cr, uid, eval(r.domain), context),
                    }
            else:
                res[r.id] = {'active': False, 'count': 0}
        return res

    def _search_active(self, cr, uid, obj, name, arg, context=None):
        ima_obj = self.pool['ir.model.access']
        ids = []
        cr.execute("""
            SELECT tt.id, im.model
            FROM tile_tile tt
            INNER JOIN ir_model im
                ON tt.model_id = im.id""")
        for result in cr.fetchall():
            if (ima_obj.check(cr, uid, result[1], 'read', False) ==
                    arg[0][2]):
                ids.append(result[0])
        return [('id', 'in', ids)]

    _columns = {
        'name': fields.char('Tile Name'),
        'model_id': fields.many2one('ir.model', 'Model'),
        'user_id': fields.many2one('res.users', 'User'),
        'domain': fields.text('Domain'),
        'action_id': fields.many2one('ir.actions.act_window', 'Action'),
        'count': fields.function(
            _get_tile_info, type='int', string='Count',
            multi='tile_info', readonly=True),
        'active': fields.function(
            _get_tile_info, type='boolean', string='Active',
            multi='tile_info', readonly=True, fnct_search=_search_active),
        'color': fields.char('Kanban Color'),
        'sequence': fields.integer(
            'Sequence', required=True),
    }

    _defaults = {
        'domain': '[]',
        'color': 0,
        'sequence': 0,
    }

    def open_link(self, cr, uid, ids, context=None):

        tile_id = ids[0]
        tile_object = self.browse(cr, uid, tile_id, context=context)

        if tile_object.action_id:
            act_obj = self.pool.get('ir.actions.act_window')
            result = act_obj.read(cr, uid, [tile_object.action_id.id],
                                  context=context)[0]
            # FIXME: restore original Domain + Filter would be better
            result['domain'] = tile_object.domain
            return result

        # we have no action_id stored,
        # so try to load a default tree view
        return {
            'name': tile_object.name,
            'view_type': 'form',
            'view_mode': 'tree',
            'view_id': [False],
            'res_model': tile_object.model_id.model,
            'type': 'ir.actions.act_window',
            'context': context,
            'nodestroy': True,
            'target': 'current',
            'domain': tile_object.domain,
        }

    def add(self, cr, uid, vals, context=None):
        # TODO: check if string
        if 'model_id' in vals:
            # need to replace model_name with its id
            model_ids = self.pool.get('ir.model').search(cr, uid,
                                                         [('model', '=',
                                                           vals['model_id'])])
            vals['model_id'] = model_ids[0]
        if 'color' not in vals:
            vals['color'] = random.randint(1, 10)
        return self.create(cr, uid, vals, context)
