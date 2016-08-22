# -*- coding: utf-8 -*-
# © 2010-2013 OpenERP s.a. (<http://openerp.com>).
# © 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
# © 2015-Today GRAP
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

import datetime
import time
from dateutil.relativedelta import relativedelta

from openerp import api, fields, models
from openerp.tools.safe_eval import safe_eval as eval
from openerp.tools.translate import _
from openerp.exceptions import ValidationError, except_orm


class TileTile(models.Model):
    _name = 'tile.tile'
    _order = 'sequence, name'

    def median(self, aList):
        # https://docs.python.org/3/library/statistics.html#statistics.median
        # TODO : refactor, using statistics.median when Odoo will be available
        #  in Python 3.4
        even = (0 if len(aList) % 2 else 1) + 1
        half = (len(aList) - 1) / 2
        return sum(sorted(aList)[half:half + even]) / float(even)

    def _get_eval_context(self):
        def _context_today():
            return fields.Date.from_string(fields.Date.context_today(self))
        context = self.env.context.copy()
        context.update({
            'time': time,
            'datetime': datetime,
            'relativedelta': relativedelta,
            'context_today': _context_today,
            'current_date': fields.Date.today(),
        })
        return context

    # Column Section
    name = fields.Char(required=True)
    sequence = fields.Integer(default=0, required=True)
    user_id = fields.Many2one('res.users', 'User')
    background_color = fields.Char(default='#0E6C7E', oldname='color')
    font_color = fields.Char(default='#FFFFFF')

    model_id = fields.Many2one('ir.model', 'Model', required=True)
    domain = fields.Text(default='[]')
    action_id = fields.Many2one('ir.actions.act_window', 'Action')

    count = fields.Integer(compute='_compute_data')
    computed_value = fields.Float(compute='_compute_data')

    field_function = fields.Selection([
        ('min', 'Minimum'),
        ('max', 'Maximum'),
        ('sum', 'Sum'),
        ('avg', 'Average'),
        ('median', 'Median'),
        ], string='Function')
    field_id = fields.Many2one(
        'ir.model.fields',
        string='Field',
        domain="[('model_id', '=', model_id),"
        " ('ttype', 'in', ['float', 'int'])]")
    helper = fields.Char(compute='_compute_function_helper')

    active = fields.Boolean(
        compute='_compute_active',
        search='_search_active',
        readonly=True)

    @api.one
    def _compute_data(self):
        self.count = 0
        self.computed_value = 0
        if self.active:
            # Compute count item
            model = self.env[self.model_id.model]
            eval_context = self._get_eval_context()
            self.count = model.search_count(eval(self.domain, eval_context))
            # Compute datas for field_id depending of field_function
            if self.field_function and self.field_id and self.count != 0:
                records = model.search(eval(self.domain, eval_context))
                vals = [x[self.field_id.name] for x in records]
                if self.field_function == 'min':
                    self.computed_value = min(vals)
                elif self.field_function == 'max':
                    self.computed_value = max(vals)
                elif self.field_function == 'sum':
                    self.computed_value = sum(vals)
                elif self.field_function == 'avg':
                    self.computed_value = sum(vals) / len(vals)
                elif self.field_function == 'median':
                    self.computed_value = self.median(vals)

    @api.one
    @api.onchange('field_function', 'field_id')
    def _compute_function_helper(self):
        self.helper = ''
        if self.field_function and self.field_id:
            desc = self.field_id.field_description
            helpers = {
                'min': "Minimum value of '%s'",
                'max': "Maximum value of '%s'",
                'sum': "Total value of '%s'",
                'avg': "Average value of '%s'",
                'median': "Median value of '%s'",
            }
            self.helper = _(helpers.get(self.field_function, '')) % desc

    @api.one
    def _compute_active(self):
        ima = self.env['ir.model.access']
        self.active = ima.check(self.model_id.model, 'read', False)

    def _search_active(self, operator, value):
        cr = self.env.cr
        if operator != '=':
            raise except_orm(
                _('Unimplemented Feature. Search on Active field disabled.'))
        ima = self.env['ir.model.access']
        ids = []
        cr.execute("""
            SELECT tt.id, im.model
            FROM tile_tile tt
            INNER JOIN ir_model im
                ON tt.model_id = im.id""")
        for result in cr.fetchall():
            if (ima.check(result[1], 'read', False) == value):
                ids.append(result[0])
        return [('id', 'in', ids)]

    # Constraints and onchanges
    @api.one
    @api.constrains('model_id', 'field_id')
    def _check_model_id_field_id(self):
        if self.field_id and self.field_id.model_id.id != self.model_id.id:
            raise ValidationError(
                _("Please select a field from the selected model."))

    @api.one
    @api.constrains('field_id', 'field_function')
    def _check_field_id_field_function(self):
        validations = self.field_id, self.field_function
        if any(validations) and not all(validations):
            raise ValidationError(
                _("Please set both: 'Field' and 'Function'."))

    # Action methods
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
                ['view_type', 'view_mode', 'type'])[0])
        return res

    @api.model
    def add(self, vals):
        if 'model_id' in vals and not vals['model_id'].isdigit():
            # need to replace model_name with its id
            vals['model_id'] = self.env['ir.model'].search(
                [('model', '=', vals['model_id'])]).id
        self.create(vals)
