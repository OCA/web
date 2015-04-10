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
from openerp.tools.translate import _


class tile(orm.Model):
    _name = 'tile.tile'
    _order = 'sequence, name'

    def median(self, aList):
        # https://docs.python.org/3/library/statistics.html#statistics.median
        # TODO : refactor, using statistics.median when Odoo will be available
        #  in Python 3.4
            even = (0 if len(aList) % 2 else 1) + 1
            half = (len(aList) - 1) / 2
            return sum(sorted(aList)[half:half + even]) / float(even)

    def _get_tile_info(self, cr, uid, ids, fields, args, context=None):
        ima_obj = self.pool['ir.model.access']
        res = {}
        records = self.browse(cr, uid, ids, context=context)
        for r in records:
            res[r.id] = {
                'active': False,
                'count': 0,
                'computed_value': 0,
                'helper': '',
            }
            if ima_obj.check(
                    cr, uid, r.model_id.model, 'read', False, context):
                # Compute count item
                model = self.pool.get(r.model_id.model)
                count = model.search_count(
                    cr, uid, eval(r.domain), context=context)
                res[r.id].update({
                    'active': True,
                    'count': count,
                })

                # Compute datas for field_id depending of field_function
                if r.field_function and r.field_id and count != 0:
                    ids = model.search(
                        cr, uid, eval(r.domain), context=context)
                    vals = [x[r.field_id.name] for x in model.read(
                        cr, uid, ids, [r.field_id.name], context=context)]
                    desc = r.field_id.field_description
                    if r.field_function == 'min':
                        value = min(vals)
                        helper = _("Minimum value of '%s'" % desc)
                    elif r.field_function == 'max':
                        value = max(vals)
                        helper = _("Maximum value of '%s'" % desc)
                    elif r.field_function == 'sum':
                        value = sum(vals)
                        helper = _("Total value of '%s'" % desc)
                    elif r.field_function == 'avg':
                        value = sum(vals) / len(vals)
                        helper = _("Average value of '%s'" % desc)
                    elif r.field_function == 'median':
                        value = self.median(vals)
                        helper = _("Median value of '%s'" % desc)
                    res[r.id].update({
                        'computed_value': value,
                        'helper': helper,
                    })
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
        'model_id': fields.many2one('ir.model', 'Model', required=True),
        'user_id': fields.many2one('res.users', 'User'),
        'domain': fields.text('Domain'),
        'action_id': fields.many2one('ir.actions.act_window', 'Action'),
        'count': fields.function(
            _get_tile_info, type='int', string='Count',
            multi='tile_info', readonly=True),
        'computed_value': fields.function(
            _get_tile_info, type='float', string='Computed Value',
            multi='tile_info', readonly=True),
        'helper': fields.function(
            _get_tile_info, type='char', string='Helper Text',
            multi='tile_info', readonly=True),
        'field_function': fields.selection([
            ('min', 'Minimum'),
            ('max', 'Maximum'),
            ('sum', 'Sum'),
            ('avg', 'Average'),
            ('median', 'Median'),
            ], 'Function'),
        'field_id': fields.many2one(
            'ir.model.fields', 'Field',
            domain="[('model_id', '=', model_id),"
            " ('ttype', 'in', ['float', 'int'])]"),
        'active': fields.function(
            _get_tile_info, type='boolean', string='Active',
            multi='tile_info', readonly=True, fnct_search=_search_active),
        'color': fields.char('Background color'),
        'font_color': fields.char('Font Color'),
        'sequence': fields.integer(
            'Sequence', required=True),
    }

    # Constraint Section
    def _check_model_id_field_id(self, cr, uid, ids, context=None):
        for t in self.browse(cr, uid, ids, context=context):
            if t.field_id and t.field_id.model_id.id != t.model_id.id:
                return False
        return True

    def _check_field_id_field_function(self, cr, uid, ids, context=None):
        for t in self.browse(cr, uid, ids, context=context):
            if t.field_id and not t.field_function or\
                    t.field_function and not t.field_id:
                return False
        return True

    _constraints = [
        (
            _check_model_id_field_id,
            "Error ! Please select a field of the selected model.",
            ['model_id', 'field_id']),
        (
            _check_field_id_field_function,
            "Error ! Please set both fields: 'Field' and 'Function'.",
            ['field_id', 'field_function']),
    ]

    _defaults = {
        'domain': '[]',
        'color': '#0E6C7E',
        'font_color': '#FFFFFF',
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
        return self.create(cr, uid, vals, context)
