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
odoo.define('web.widgets.polymorphic_widget', function (require) {
"use strict";

var core = require('web.core');

var field_many2one = core.form_widget_registry.get('many2one');

var FieldPolymorphic = field_many2one.extend( {
    template: "FieldMany2One",

    init: function(field_manager, node) {
        this._super(field_manager, node);
        this.can_create = false;
        this.can_write = false;
        this.options.no_open = true;
        this.polymorphic = this.node.attrs.polymorphic;
    },
    get_search_result: function(search_val) {
        this.field.relation = this.field_manager.get_field_value(
            this.polymorphic);
        return this._super(search_val);
    },

    render_value: function(no_recurse) {
        this.field.relation = this.field_manager.get_field_value(
            this.polymorphic);
        return this._super(no_recurse);
    },
});

core.form_widget_registry.add('polymorphic', FieldPolymorphic);

});
