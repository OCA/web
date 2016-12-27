# -*- coding: utf-8 -*-
# © 2010-2013 OpenERP s.a. (<http://openerp.com>).
# © 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
# © 2015-Today GRAP
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

import datetime
import time
from dateutil.relativedelta import relativedelta
from collections import OrderedDict

from openerp import api, fields, models
from openerp.tools.safe_eval import safe_eval as eval
from openerp.tools.translate import _
from openerp.exceptions import ValidationError, except_orm


def median(vals):
    # https://docs.python.org/3/library/statistics.html#statistics.median
    # TODO : refactor, using statistics.median when Odoo will be available
    #  in Python 3.4
    even = (0 if len(vals) % 2 else 1) + 1
    half = (len(vals) - 1) / 2
    return sum(sorted(vals)[half:half + even]) / float(even)


FIELD_FUNCTIONS = OrderedDict([
    ('count', {
        'name': 'Count',
        'func': False,  # its hardcoded in _compute_data
        'help': _('Number of records')}),
    ('min', {
        'name': 'Minimum',
        'func': min,
        'help': _("Minimum value of '%s'")}),
    ('max', {
        'name': 'Maximum',
        'func': max,
        'help': _("Maximum value of '%s'")}),
    ('sum', {
        'name': 'Sum',
        'func': sum,
        'help': _("Total value of '%s'")}),
    ('avg', {
        'name': 'Average',
        'func': lambda vals: sum(vals) / len(vals),
        'help': _("Minimum value of '%s'")}),
    ('median', {
        'name': 'Median',
        'func': median,
        'help': _("Median value of '%s'")}),
])


FIELD_FUNCTION_SELECTION = [
    (k, FIELD_FUNCTIONS[k].get('name')) for k in FIELD_FUNCTIONS]


class TileTile(models.Model):
    _name = 'tile.tile'
    _description = 'Dashboard Tile'
    _order = 'sequence, name'

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

    group_ids = fields.Many2many(
        'res.groups',
        string='Groups',
        help='If this field is set, only users of this group can view this '
             'tile. Please note that it will only work for global tiles '
             '(that is, when User field is left empty)')

    model_id = fields.Many2one('ir.model', 'Model', required=True)
    domain = fields.Text(default='[]')
    action_id = fields.Many2one('ir.actions.act_window', 'Action')

    active = fields.Boolean(
        compute='_compute_active',
        search='_search_active',
        readonly=True)

    # Primary Value
    primary_function = fields.Selection(
        FIELD_FUNCTION_SELECTION,
        string='Function',
        default='count')
    primary_field_id = fields.Many2one(
        'ir.model.fields',
        string='Field',
        domain="[('model_id', '=', model_id),"
               " ('ttype', 'in', ['float', 'integer', 'monetary'])]")
    primary_format = fields.Char(
        string='Format',
        help='Python Format String valid with str.format()\n'
             'ie: \'{:,} Kgs\' will output \'1,000 Kgs\' if value is 1000.')
    primary_value = fields.Char(
        string='Value',
        compute='_compute_data')
    primary_helper = fields.Char(
        string='Helper',
        compute='_compute_helper')

    # Secondary Value
    secondary_function = fields.Selection(
        FIELD_FUNCTION_SELECTION,
        string='Secondary Function')
    secondary_field_id = fields.Many2one(
        'ir.model.fields',
        string='Secondary Field',
        domain="[('model_id', '=', model_id),"
               " ('ttype', 'in', ['float', 'integer', 'monetary'])]")
    secondary_format = fields.Char(
        string='Secondary Format',
        help='Python Format String valid with str.format()\n'
             'ie: \'{:,} Kgs\' will output \'1,000 Kgs\' if value is 1000.')
    secondary_value = fields.Char(
        string='Secondary Value',
        compute='_compute_data')
    secondary_helper = fields.Char(
        string='Secondary Helper',
        compute='_compute_helper')

    error = fields.Char(
        string='Error Details',
        compute='_compute_data')

    @api.one
    def _compute_data(self):
        if not self.active:
            return
        model = self.env[self.model_id.model]
        eval_context = self._get_eval_context()
        domain = self.domain or '[]'
        try:
            count = model.search_count(eval(domain, eval_context))
        except Exception as e:
            self.primary_value = self.secondary_value = 'ERR!'
            self.error = str(e)
            return
        if any([
            self.primary_function and
            self.primary_function != 'count',
            self.secondary_function and
            self.secondary_function != 'count'
        ]):
            records = model.search(eval(domain, eval_context))
        for f in ['primary_', 'secondary_']:
            f_function = f + 'function'
            f_field_id = f + 'field_id'
            f_format = f + 'format'
            f_value = f + 'value'
            value = 0
            if self[f_function] == 'count':
                value = count
            elif self[f_function]:
                func = FIELD_FUNCTIONS[self[f_function]]['func']
                if func and self[f_field_id] and count:
                    vals = [x[self[f_field_id].name] for x in records]
                    value = func(vals)
            if self[f_function]:
                try:
                    self[f_value] = (self[f_format] or '{:,}').format(value)
                except ValueError as e:
                    self[f_value] = 'F_ERR!'
                    self.error = str(e)
                    return
            else:
                self[f_value] = False

    @api.one
    @api.onchange('primary_function', 'primary_field_id',
                  'secondary_function', 'secondary_field_id')
    def _compute_helper(self):
        for f in ['primary_', 'secondary_']:
            f_function = f + 'function'
            f_field_id = f + 'field_id'
            f_helper = f + 'helper'
            self[f_helper] = ''
            field_func = FIELD_FUNCTIONS.get(self[f_function], {})
            help = field_func.get('help', False)
            if help:
                if self[f_function] != 'count' and self[f_field_id]:
                    desc = self[f_field_id].field_description
                    self[f_helper] = help % desc
                else:
                    self[f_helper] = help

    @api.one
    def _compute_active(self):
        ima = self.env['ir.model.access']
        for rec in self:
            rec.active = ima.check(rec.model_id.model, 'read', False)

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
    @api.multi
    @api.constrains('model_id', 'primary_field_id', 'secondary_field_id')
    def _check_model_id_field_id(self):
        for rec in self:
            if any([
                rec.primary_field_id and
                rec.primary_field_id.model_id.id != rec.model_id.id,
                rec.secondary_field_id and
                rec.secondary_field_id.model_id.id != rec.model_id.id
            ]):
                raise ValidationError(
                    _("Please select a field from the selected model."))

    @api.onchange('model_id')
    def _onchange_model_id(self):
        self.primary_field_id = False
        self.secondary_field_id = False

    @api.onchange('primary_function', 'secondary_function')
    def _onchange_function(self):
        if self.primary_function in [False, 'count']:
            self.primary_field_id = False
        if self.secondary_function in [False, 'count']:
            self.secondary_field_id = False

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
