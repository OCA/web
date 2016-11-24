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
            return _.str.sprintf('<a class="oe_form_uri" data-many2one-clickable-model="%s" data-many2one-clickable-id="%s">%s</a>',
                this.relation,
                row_data[this.id].value[0],
                _.escape(row_data[this.id].value[1] || options.value_if_empty));
        },
    });

    openerp.web.ListView.List.include({
        render: function()
        {
            var result = this._super(this, arguments),
                self = this;
            this.$current.delegate('a[data-many2one-clickable-model]',
                'click', function()
                {
                    self.view.do_action({
                        type: 'ir.actions.act_window',
                        res_model: jQuery(this).data('many2one-clickable-model'),
                        res_id: jQuery(this).data('many2one-clickable-id'),
                        views: [[false, 'form']],
                    });
                });
            return result;
        },
    });
}
