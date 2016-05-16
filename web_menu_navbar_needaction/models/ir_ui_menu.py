# -*- coding: utf-8 -*-
##############################################################################
#
#    This module copyright (C) 2015 Therp BV (<http://therp.nl>).
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
from openerp import _, models, api, fields
from openerp.tools.safe_eval import safe_eval
from openerp.exceptions import Warning as UserError
from openerp.osv import expression


class IrUiMenu(models.Model):
    _inherit = 'ir.ui.menu'

    needaction = fields.Boolean(
        help='Set to False to disable needaction for specific menu items',
        default=True)
    needaction_domain = fields.Char(
        help='If your menu item needs a different domain, set it here. It '
        'will override the model\'s needaction domain completely.')

    @api.multi
    def get_navbar_needaction_data(self):
        result = {}
        for this in self:
            count_per_model = {}
            if not this.needaction:
                continue
            for menu_id, needaction in self.search(
                    [('id', 'child_of', this.ids)])._filter_visible_menus()\
                    .get_needaction_data().iteritems():
                if needaction['needaction_enabled']:
                    menu = self.env['ir.ui.menu'].browse(menu_id)
                    model = menu.action.res_model
                    count_per_model[model] = max(
                        count_per_model.get(model),
                        needaction['needaction_counter']
                    )
            result[this.id] = sum(count_per_model.itervalues())
        return result

    @api.multi
    def get_needaction_data(self):
        result = super(IrUiMenu, self).get_needaction_data()
        for this in self:
            data = result[this.id]
            if data['needaction_enabled']:
                if not this.needaction:
                    data['needaction_enabled'] = False
                    data['needaction_counter'] = 0
                    continue
                if this.needaction_domain:
                    data['needaction_counter'] = self\
                        .env[this.action.res_model].search_count(
                            this._eval_needaction_domain())
        return result

    @api.multi
    def _eval_needaction_domain(self):
        self.ensure_one()
        if not self.needaction_domain:
            return []
        return safe_eval(
            self.needaction_domain, locals_dict={
                'uid': self.env.user.id,
                'user': self.env.user,
            })

    @api.constrains('needaction_domain')
    @api.multi
    def _check_needaction_domain(self):
        for this in self:
            try:
                expression.AND([
                    this._eval_needaction_domain(),
                    expression.TRUE_DOMAIN,
                ])
            except Exception as ex:
                raise UserError(
                    _('Cannot evaluate %s to a search domain:\n %s') %
                    self.needaction_domain,
                    ex)
