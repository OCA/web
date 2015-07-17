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

from openerp import api, fields
from openerp.models import Model
from openerp.exceptions import except_orm
from openerp.tools.translate import _


class TileTile(Model):
    _name = 'tile.tile'
    _order = 'sequence, name'

    def median(self, aList):
        # https://docs.python.org/3/library/statistics.html#statistics.median
        # TODO : refactor, using statistics.median when Odoo will be available
        #  in Python 3.4
            even = (0 if len(aList) % 2 else 1) + 1
            half = (len(aList) - 1) / 2
            return sum(sorted(aList)[half:half + even]) / float(even)

    def _get_tile_info(self):
        ima_obj = self.env['ir.model.access']
        res = {}
        for r in self:
            r.active = False
            r.count = 0
            r.computed_value = 0
            helper = ''
            if ima_obj.check(r.model_id.model, 'read', False):
                # Compute count item
                model = self.env[r.model_id.model]
                r.count = model.search_count(eval(r.domain))
                r.active = True

                # Compute datas for field_id depending of field_function
                if r.field_function and r.field_id and r.count != 0:
                    records = model.search(eval(r.domain))
                    vals = [x[r.field_id.name] for x in records]
                    desc = r.field_id.field_description
                    if r.field_function == 'min':
                        r.computed_value = min(vals)
                        r.helper = _("Minimum value of '%s'") % desc
                    elif r.field_function == 'max':
                        r.computed_value = max(vals)
                        r.helper = _("Maximum value of '%s'") % desc
                    elif r.field_function == 'sum':
                        r.computed_value = sum(vals)
                        r.helper = _("Total value of '%s'") % desc
                    elif r.field_function == 'avg':
                        r.computed_value = sum(vals) / len(vals)
                        r.helper = _("Average value of '%s'") % desc
                    elif r.field_function == 'median':
                        r.computed_value = self.median(vals)
                        r.helper = _("Median value of '%s'") % desc
        return res

    def _search_active(self, operator, value):
        cr = self.env.cr
        if operator != '=':
            raise except_orm(
                'Unimplemented Feature',
                'Search on Active field disabled.')
        ima_obj = self.env['ir.model.access']
        ids = []
        cr.execute("""
            SELECT tt.id, im.model
            FROM tile_tile tt
            INNER JOIN ir_model im
                ON tt.model_id = im.id""")
        for result in cr.fetchall():
            if (ima_obj.check(result[1], 'read', False) == value):
                ids.append(result[0])
        return [('id', 'in', ids)]

    # Column Section
    name=fields.Char(required=True)
    model_id=fields.Many2one(
        comodel_name='ir.model', string='Model', required=True)
    user_id=fields.Many2one(
        comodel_name='res.users', string='User')
    domain=fields.Text(default='[]')
    action_id=fields.Many2one(
        comodel_name='ir.actions.act_window', string='Action')
    count=fields.Integer(
        compute='_get_tile_info', readonly=True) #readonly usefull ?
    computed_value=fields.Float(
        compute='_get_tile_info', readonly=True) #readonly usefull ?
    helper=fields.Char(
        compute='_get_tile_info', readonly=True) #readonly usefull ?
    field_function=fields.Selection(selection=[
        ('min', 'Minimum'),
        ('max', 'Maximum'),
        ('sum', 'Sum'),
        ('avg', 'Average'),
        ('median', 'Median'),
        ], string='Function')
    field_id=fields.Many2one(
        comodel_name='ir.model.fields', string='Field',
        domain="[('model_id', '=', model_id),"
        " ('ttype', 'in', ['float', 'int'])]")
    active=fields.Boolean(
        compute='_get_tile_info', readonly=True, search='_search_active')
    color=fields.Char(default='#0E6C7E', string='Background Color')
    font_color=fields.Char(default='#FFFFFF')
    sequence=fields.Integer(default=0, required=True)

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

    # View / action Section
    @api.multi
    def open_link(self):
        res = {
            'name': self.name,
            'view_type': 'form',
            'view_mode': 'tree',
            'view_id': [False],
            'res_model': self.model_id.model,
            'type': 'ir.actions.act_window',
            'context': self.env.context,
            'nodestroy': True,
            'target': 'current',
            'domain': self.domain,
        }
        if self.action_id:
            res.update(self.action_id.read(
                ['view_type', 'view_mode', 'view_id', 'type'])[0])
            # FIXME: restore original Domain + Filter would be better
        return res

    @api.model
    def add(self, vals):
        if 'model_id' in vals and not vals['model_id'].isdigit():
            # need to replace model_name with its id
            vals['model_id'] = self.env['ir.model'].search(
                [('model', '=', vals['model_id'])]).id
        self.create(vals)
