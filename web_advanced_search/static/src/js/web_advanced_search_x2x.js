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

odoo.define('web_advanced_search_x2x.search_filters', function (require) {
    "use strict";

    var filters = require('web.search_filters');
    var form_common = require('web.form_common');
    var SearchView = require('web.SearchView');
    var data = require('web.data');
    var session = require('web.session');
    var core = require('web.core');

    var searchfilters = filters.ExtendedSearchProposition.Char.extend(
    form_common.FieldManagerMixin,
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
            this.operators.push({
                'value': 'domain', 'text': data._lt('is in selection'),
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
            this.searchfield = new form_common.FieldMany2One(
                this, this.create_searchfield_node());
            return this.searchfield;
        },
        operator_changed: function(e)
        {
            if(this.searchfield)
            {
                this.searchfield.destroy();
            }
            this.renderElement();
            if(this.show_searchfield())
            {
                this.create_searchfield().appendTo(this.$el.empty());
            }
            if(this.show_domain_selection())
            {
                this.$el.filter('input').remove();
                this.$el.filter('button.web_advanced_search_x2x_search').click(
                    this.proxy(this.popup_domain_selection));
                this.popup_domain_selection();
            }
        },
        get_operator: function()
        {
            if(this.isDestroyed())
            {
                return false;
            }
            return this.getParent().$('.searchview_extended_prop_op').val();
        },
        show_searchfield: function()
        {
            var operator = this.get_operator()
            return operator == '=' || operator == '!=';
        },
        show_domain_selection: function()
        {
            return this.get_operator() == 'domain';
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
            var value = null;
            if(this.show_searchfield() && this.searchfield)
            {
                value = this.searchfield.display_value[
                    String(this.searchfield.get_value())];
            }
            if(this.show_domain_selection() && this.domain_representation)
            {
                value = this.domain_representation;
            }
            if(value)
            {
                return _.str.sprintf(
                    format,
                    {
                        field: field.string,
                        operator: operator.label || operator.text,
                        value: value,
                    }
                );
            }
            return this._super.apply(this, arguments);
        },
        get_domain: function()
        {
            if(this.show_domain_selection())
            {
                var self = this;
                if(!this.domain || this.domain.length == 0)
                {
                    throw new filters.Invalid(
                        this.field.string, this.domain_representation,
                        data._lt('invalid search domain'));
                }
                return _.extend(new data.CompoundDomain(), {
                    __domains: [
                        _.map(this.domain, function(leaf)
                        {
                            if(_.isArray(leaf) && leaf.length == 3)
                            {
                                return [
                                    self.field.name + '.' + leaf[0],
                                    leaf[1],
                                    leaf[2]
                                ]
                            }
                            return leaf;
                        }),
                    ],
                })
            }
            return this._super.apply(this, arguments);
        },
        popup_domain_selection: function()
        {
            var self = this,
                popup = new form_common.SelectCreatePopup(this);
            popup.on('domain_selected', this, function(domain, domain_representation)
            {
                self.$el.filter('.web_advanced_search_x2x_domain').text(
                    domain_representation);
                self.domain = domain;
                self.domain_representation = domain_representation;
            });
            popup.select_element(
                this.field.relation, {}, this.field.domain,
                new data.CompoundContext(
                    session.user_context, this.field.context));
        },
    });


    SearchView.include({
        build_search_data: function()
        {
            //Advanced.commit_search can only cope with propositions
            //(=domain leaves),
            //so we need to rebuild the domain if one of our CompoundDomains
            //is involved
            var result = this._super.apply(this, arguments);
            _.each(result.domains, function(domain, index)
            {
                if(!_.isArray(domain))
                {
                    return;
                }
                var compound_domains = [], leaves = [];
                _.each(domain, function(leaf)
                {
                    if(leaf instanceof data.CompoundDomain)
                    {
                        compound_domains.push(leaf);
                    }
                    if(_.isArray(leaf))
                    {
                        leaves.push(leaf);
                    }
                });
                if(compound_domains.length)
                {
                    var combined = new data.CompoundDomain();
                    _.each(compound_domains, function(domain)
                    {
                        combined.add(domain.eval());
                    })
                    _.each(leaves, function(leaf)
                    {
                        combined.add([leaf])
                    });
                    result.domains[index] = combined;
                }
            });
            return result;
        },
    })
});
