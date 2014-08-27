//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2014 Therp BV (<http://therp.nl>).
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

openerp.web_statusbar_clickable = function(instance)
{
    instance.web.form.FieldStatus.include({
        render_list: function()
        {
            this._super.apply(this, arguments);
            if(this.node.attrs.clickable)
            {
                this.$element.find('ul').addClass('oe_form_status_clickable');
                this.$element.find('li').click(this.on_state_clicked);
            }
        },
        on_state_clicked: function(e)
        {
            var self = this,
                clicked_val = jQuery(e.currentTarget).data('id');
            if(clicked_val != this.value)
            {
                this.view.recursive_save().then(function()
                {
                    var data = {}
                    data[self.name] = clicked_val;
                    self.view.dataset.write(
                        self.view.datarecord.id, data)
                        .then(function()
                        {
                            self.view.reload();
                        });
                });
            }
        },
    });
}
