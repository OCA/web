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
from openerp import models, api


class IrUiMenu(models.Model):
    _inherit = 'ir.ui.menu'

    @api.multi
    def get_navbar_needaction_data(self):
        result = {}
        for this in self:
            count_per_model = {}
            for menu_id, needaction in self.search(
                    [('id', 'child_of', this.ids)])._filter_visible_menus()\
                    .get_needaction_data().iteritems():
                if needaction['needaction_enabled']:
                    model = self.env['ir.ui.menu'].browse(menu_id).action\
                        .res_model
                    count_per_model[model] = max(
                        count_per_model.get(model),
                        needaction['needaction_counter'])
            result[this.id] = sum(count_per_model.itervalues())
        return result
