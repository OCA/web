# coding: utf-8
# © 2015 David BEAL @ Akretion <david.beal@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import _, api, models, fields


class ErpHelp(models.AbstractModel):
    _name = 'erp.help'

    enduser_help = fields.Html(
        string="End User Help",
        help="Use this field to add custom content for documentation purpose\n"
             "mainly by power users ")
    advanced_help = fields.Text(
        string="Advanced Help", groups='base.group_no_one',
        help="Use this field to add custom content for documentation purpose\n"
             "mainly by developers or consultants")


class IrModel(models.Model):
    _inherit = ['ir.model', 'erp.help']
    _name = 'ir.model'


class IrActionsActwindow(models.Model):
    _inherit = ['ir.actions.act_window', 'erp.help']
    _name = 'ir.actions.act_window'
    _rpt_menu = False

    enduser_help_model = fields.Html(
        string='Enduser Help from Model', store="True",
        compute='_compute_model_help', inverse='_inverse_model_help',
        help="")
    advanced_help_model = fields.Text(
        string='Advanced Help from model', store="True",
        compute='_compute_model_help', inverse='_inverse_model_help',
        help="")
    action_help = fields.Boolean(string="Display Action Help")
    help_has_content = fields.Boolean(
        string="Content in help", compute='_compute_contains_help',
        help="One of the help has content")

    @api.one
    @api.depends('enduser_help', 'advanced_help',
                 'enduser_help_model', 'advanced_help_model')
    def _compute_contains_help(self):
        if (self.enduser_help or self.enduser_help_model or
                self.advanced_help or self.advanced_help_model):
            self.help_has_content = True
        else:
            self.help_has_content = False

    @api.multi
    def _compute_model_help(self):
        for rec in self:
            model = rec.env['ir.model'].search([('model', '=', rec.res_model)])
            rec.enduser_help_model = model.enduser_help
            rec.advanced_help_model = model.advanced_help

    def _inverse_model_help(self):
        for rec in self:
            model = rec.env['ir.model'].search([('model', '=', rec.res_model)])
            model.enduser_help = rec.enduser_help_model
            model.advanced_help = rec.advanced_help_model

    @api.multi
    def open_help_popup(self):
        """ Open in a new tab instead of in popup"""
        self.ensure_one()
        return {
            'name': _('Open help for this action'),
            'type': 'ir.actions.act_url',
            'url': 'report/html/help_popup.tpl_help/%s' % self.id,
            'target': 'new',
        }

    @api.model
    def get_help_actions(self):
        """ called by the template"""
        self._rpt_menu = self.get_main_menu()
        menu_names = self.get_menu_names(self._rpt_menu)
        actions = self.search([
            ('id', 'in', menu_names.keys()),
            '|', '|', '|',
            ('enduser_help', '!=', False),
            ('enduser_help_model', '!=', False),
            ('advanced_help', '!=', False),
            ('advanced_help_model', '!=', False),
        ])
        return actions

    @api.model
    def get_main_menu(self):
        self._rpt_menu = False
        ir_vals = self.env['ir.values'].search([
            ('key2', '=', 'tree_but_open'),
            ('key', '=', 'action'),
            ('res_id', '>', 0),
            ('value', '=', 'ir.actions.act_window,%s' % self.id),
        ])
        if ir_vals:
            # we only keep the first menu beacause we have no info on menu_id
            self._rpt_menu = self.env['ir.ui.menu'].browse(ir_vals[0].res_id)
            while self._rpt_menu.parent_id:
                self._rpt_menu = self._rpt_menu.parent_id
            return self._rpt_menu

    @api.model
    def get_menu_names(self, main_menu):
        """ @return dict {action_id: 'menu name'} """
        menus = self.env['ir.ui.menu'].search(
            [('id', 'child_of', main_menu.id)])
        ir_vals = self.env['ir.values'].search([
            ('key2', '=', 'tree_but_open'),
            ('key', '=', 'action'),
            ('res_id', 'in', menus.ids),
            ('value', 'like', 'ir.actions.act_window,%'),
        ])
        map_menu = {x.id: x.name for x in menus}
        return {int(x.value[22:]): map_menu[x.res_id] for x in ir_vals}

    def _anchorize(self, string):
        """ called by template """
        for char in ["'", '"', ' ']:
            string = string.replace(char, '-')
        return string
