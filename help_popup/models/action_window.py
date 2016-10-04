# coding: utf-8
# © 2015 David BEAL @ Akretion <david.beal@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging
import inspect

from openerp import _, api, models, fields

_logger = logging.getLogger(__name__)

try:
    from bs4 import BeautifulSoup as BSHTML
except ImportError:
    _logger.debug(
        'Beautifulsoup required for help_popup module is not installed')


class IrActionsActwindow(models.Model):
    _inherit = ['ir.actions.act_window', 'erp.help']
    _name = 'ir.actions.act_window'
    _rpt_menu = False

    enduser_help_model = fields.Html(
        string='Enduser Help from Model', related='model_id.enduser_help',
        help="")
    advanced_help_model = fields.Text(
        string='Advanced Help from model', related='model_id.advanced_help',
        help="")
    action_help = fields.Boolean(string="Display Action Help")
    help_has_content = fields.Boolean(
        string="Content in help", compute='_compute_contains_help',
        help="One of the help field has content")
    model_id = fields.Many2one(
        string='Model', comodel_name='ir.model', store=True,
        compute='_compute_model_id')

    @api.one
    @api.depends('enduser_help', 'advanced_help',
                 'enduser_help_model', 'advanced_help_model')
    def _compute_contains_help(self):
        if (self.enduser_help or self.enduser_help_model or
                self.advanced_help or self.advanced_help_model):
            self.help_has_content = True
        else:
            self.help_has_content = False

    @api.one
    @api.depends('res_model')
    def _compute_model_id(self):
        if self.res_model:
            model = self.env['ir.model'].search(
                [('model', '=', self.res_model)])
            if model:
                self.model_id = model.id

    @api.multi
    def write(self, vals):
        if self._context.get('install_mode'):
            module_name = self.module_being_processing()
            for field in ['advanced_help', 'advanced_help_model']:
                if module_name and field in vals:
                    self._update_help_field(vals, field, module_name)
        return super(IrActionsActwindow, self).write(vals)

    @api.multi
    def _update_help_field(self, vals, field, module_name):
        """ update partially the content of the field according to
            which inserted information inside
        """
        new_val_field = u'<help_%s>%s</help_%s>' % (
                        module_name, vals[field] or '', module_name)
        original_val_field = vals[field]
        vals[field] = new_val_field
        if self[field]:
            # we search this string in field:
            # <help_mymodule> ... any content ... </help_mymodule>
            tag = getattr(
                BSHTML(self[field]), 'help_%s' % module_name)
            if tag:
                old_content = ''.join(
                    [unicode(x) for x in tag.contents if x]) or u''
                vals[field] = self[field].replace(
                    old_content, original_val_field)
            else:
                vals[field] = u'\n%s%s' % (
                    self[field], new_val_field)

    @api.model
    def module_being_processing(self):
        for elm in inspect.stack():
            arg_values = inspect.getargvalues(elm[0])
            if 'locals' in arg_values.__dict__:
                module_name = arg_values.__dict__['locals'].get('module')
                if module_name and \
                        module_name not in self.env.registry._init_modules:
                    return module_name
        # We don't know stack evolution in future versions, alert required
        _logger.warning("'module_being_processing()' hasn't found "
                        "module name in the stack. Please check this method.")
        return False

    @api.multi
    def button_open_help_popup(self):
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
        """ called by qweb template"""
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
            # we only keep the first menu because we have no info on menu_id
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
        """ called by qweb template """
        for char in ["'", '"', ' ']:
            string = string.replace(char, '-')
        return string

    @api.one
    def remove_obsolete_help(self, module_name):
        """ We need to remove some partial content of the file """
        for field in ['advanced_help', 'advanced_help_model']:
            if not self[field]:
                continue
            tag = getattr(BSHTML(self[field]), 'help_%s' % module_name)
            if tag:
                old_content = ''.join(
                    [unicode(x) for x in tag.contents if x])
                if old_content:
                    to_replace = '<help_%s>%s</help_%s>' % (
                        module_name, old_content, module_name)
                    value = self[field].replace(to_replace, '')
                    self.write({field: value})
