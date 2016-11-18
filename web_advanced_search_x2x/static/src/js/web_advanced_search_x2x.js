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

odoo.define('web_advanced_search_x2x.web_advanced_search_x2x', function (require) {
"use strict";
    var core = require('web.core');
    var data = require('web.data');
    var form_common = require('web.form_common');
    var form_relational = require('web.form_relational');
    var search_filters = require('web.search_filters');
    var session = require('web.session');
    var SearchView = require('web.SearchView');
    var pyeval = require('web.pyeval');
    var crash_manager = require('web.crash_manager');
    var QWeb = core.qweb;
    
    var ExtendedSearchPropositionMany2One = search_filters.ExtendedSearchProposition.Char.extend(
    form_common.FieldManagerMixin,
    {
        template: 'web_advanced_search_x2x.proposition.many2one',
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
                'value': 'domain', 'text': core._lt('is in selection'),
            });
            return this._super.apply(this, arguments);
        },
        start: function()
        {
            this.getParent().$('.o_searchview_extended_prop_op')
            .on('change', this.proxy('operator_changed'));
            this.$('body ul.ui-autocomplete').click('.ui-menu-item a', function(e){this.stay_open(); });  // this does not work!
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
            this.searchfield = new form_relational.FieldMany2One(
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
                this.getParent().$el.find('input').remove();
                this.getParent().$el.find('button.web_advanced_search_x2x_search').click(
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
            return this.getParent().$('.o_searchview_extended_prop_op').val();
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
                    crash_manager.show_message(this.field.string + this.domain_representation + core._lt('invalid search domain'));                    
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
        domain_selected: function(domain, domain_representation)        
        {
            var self = this;
            self.getParent().$el.find('.web_advanced_search_x2x_domain').text(
                domain_representation);
            console.log(domain_representation + ':domain representation here')
            self.domain = domain;
            self.domain_representation = domain_representation;
            self.stay_open();
        },           
        
        // to fix the problem that when select item from dropdown list for is equal to or is not equal to by click or close the popup window for is in selection the filter menu closed automatically
        stay_open: function(){   
            var self = this;            
            if (!self.getParent().getParent().$el.hasClass('open')){
                self.getParent().getParent().$el.find('button:first').click();
                self.getParent().getParent().toggle_custom_filter_menu(true);
            };
        },
        
        popup_domain_selection: function()
        {
            var self = this,               
                popup = new form_common.SelectCreateDialog(this, _.extend({}, (this.options || {}), {
                    res_model: self.field.relation,
                    domain: self.field.domain,
                    context: new data.CompoundContext(session.user_context, this.field.context ||{}),                    
                    //title: (view === 'search' ? _t("Search: ") : _t("Create: ")) + this.string,
                    disable_multiple_selection: false,
                    on_selected: function(ids) {
                        var def = this.dataset.name_get(ids)
                        def.then(function(name_gets){
                            var names = _.reduce(name_gets, function(memo, name_get)
                            {
                                return memo + (memo ? ', ' : '') + name_get[1];
                            }, '');                            
                            self.domain_selected([['id', 'in', ids]], names);
                            console.log('domain selection triggerred');
                        });
                        return $.when(def);
                    },
                })).open();                               
        },
    });

    core.search_filters_registry.add('one2many',ExtendedSearchPropositionMany2One);
    core.search_filters_registry.add('many2many',ExtendedSearchPropositionMany2One);
    core.search_filters_registry.add('many2one', ExtendedSearchPropositionMany2One);    

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
})

