//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2013 Therp BV (<http://therp.nl>).
//
//   This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as
//   published by the Free Software Foundation, either version 3 of the
//   License, or (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU Affero General Public License for more details.
//
//   You should have received a copy of the GNU Affero General Public License
//   along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//############################################################################

openerp.web_tree_many2one_clickable = function(openerp)
{
    openerp.web.list.columns.add(
            'field.many2one_clickable',
            'instance.web_tree_many2one_clickable.Many2OneClickable');
    openerp.web_tree_many2one_clickable.Many2OneClickable = openerp.web.list.Column.extend({
        _format: function (row_data, options)
        {
            var link = _.escape(row_data[this.id].value[1] || options.value_if_empty);
            var code = "_.each(openerp.instances, function(instance) {\n" +
                "instance.webclient.action_manager.do_action({" +
                    "type: 'ir.actions.act_window', \n" +
                    _.str.sprintf("res_model: '%s',\n", this.relation) +
                    _.str.sprintf("res_id: %s,\n", row_data[this.id].value[0]) +
                    "views: [[false, 'form']],\n" +
                    "target: 'current'\n" +
                "})})";
            link = _.str.sprintf('<a class="oe_form_uri" onclick="%s">%s</a>',
                code,
                link)
            return link;
        },
    });
}
