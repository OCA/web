//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2015 Therp BV <http://therp.nl>.
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

openerp.web_advanced_search_x2x = function(instance)
{
    instance.web_advanced_search_x2x.ExtendedSearchPropositionMany2One = 
    instance.web.search.ExtendedSearchProposition.Char.extend(
    instance.web.form.FieldManagerMixin,
    {
        template: 'web_advanced_search_x2x.extended_search.proposition.many2one',
        searchfield: null,
        init: function()
        {
            this.operators = _.sortBy(
                this.operators,
                function(op)
                {
                    switch(op.value)
                    {
                        case '=':
                            return -2;
                        case '!=':
                            return -1;
                        default:
                            return 0;
                    }
                });
            return this._super.apply(this, arguments);
        },
        start: function()
        {
            this.getParent().$('.searchview_extended_prop_op')
            .on('change', this.proxy('operator_changed'));
            return this._super.apply(this, arguments).then(
                this.proxy(this.operator_changed));
        },
        get_field_desc: function()
        {
            return this.field;
        },
        create_searchfield_node: function()
        {
            return {
                attrs: {
                    name: this.field.name,
                    options: '{"no_create": true}',
                },
            }
        },
        create_searchfield: function()
        {
            if(this.searchfield)
            {
                this.searchfield.destroy();
            }
            this.searchfield = new instance.web.form.FieldMany2One(
                this, this.create_searchfield_node());
            return this.searchfield;
        },
        operator_changed: function(e)
        {
            this.renderElement();
            if(this.show_searchfield())
            {
                this.create_searchfield().appendTo(this.$el.empty());
            }
        },
        show_searchfield: function()
        {
            if(this.isDestroyed())
            {
                return false;
            }
            var operator = this.getParent().$('.searchview_extended_prop_op')
                .val();
            return operator == '=' || operator == '!=';
        },
        get_value: function()
        {
            if(this.show_searchfield() && this.searchfield)
            {
                return this.searchfield.get_value();
            }
            return this._super.apply(this, arguments);
        },
        format_label: function(format, field, operator)
        {
            if(this.show_searchfield() && this.searchfield)
            {
                return _.str.sprintf(
                    format,
                    {
                        field: field.string,
                        operator: operator.label || operator.text,
                        value: this.searchfield.display_value[
                            String(this.searchfield.get_value())],

                    }
                );
            }
            return this._super.apply(this, arguments);
        },
    });
    instance.web.search.custom_filters.add(
        'one2many',
        'instance.web_advanced_search_x2x.ExtendedSearchPropositionMany2One');
    instance.web.search.custom_filters.add(
        'many2many',
        'instance.web_advanced_search_x2x.ExtendedSearchPropositionMany2One');
    instance.web.search.custom_filters.add(
        'many2one',
        'instance.web_advanced_search_x2x.ExtendedSearchPropositionMany2One');
}
