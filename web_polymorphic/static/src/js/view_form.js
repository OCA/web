/******************************************************************************
*
*    OpenERP, Open Source Management Solution
*    Copyright (c) 2010-2014 Elico Corp. All Rights Reserved.
*    Augustin Cisterne-Kaas <augustin.cisterne-kaas@elico-corp.com>
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Affero General Public License as
*    published by the Free Software Foundation, either version 3 of the
*    License, or (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
******************************************************************************/
openerp.web_polymorphic = function (instance) {
    instance.web.form.FieldPolymorphic = instance.web.form.FieldMany2One.extend( {
        template: "FieldMany2One",
        events: {
            'focus input': function(e) {
                this.field.relation = this.field_manager.get_field_value(this.polymorphic);
            },
            'click input': function(e) {
                this.field.relation = this.field_manager.get_field_value(this.polymorphic);
            }
        },
        init: function(field_manager, node) {
            this._super(field_manager, node);
            this.polymorphic = this.node.attrs.polymorphic;
        },
        render_editable: function() {
            var self = this;
            this.$drop_down = this.$el.find(".oe_m2o_drop_down_button");
            this.$drop_down.click(function() {
                self.polymorphic = self.node.attrs.polymorphic;
                self.field.relation = self.field_manager.get_field_value(self.polymorphic);              
            });
            this._super();
        }
    });
    instance.web.form.widgets.add('polymorphic', 'instance.web.form.FieldPolymorphic')
};
