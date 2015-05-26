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
            this.operators.push({
                'value': 'domain', 'text': instance.web._lt('is in selection'),
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
            if(this.show_domain_selection() && this.domain)
            {
                var self = this;
                return _.extend(new instance.web.CompoundDomain(), {
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
                popup = new instance.web_advanced_search_x2x.SelectCreatePopup(this);
            popup.on('domain_selected', this, function(domain, domain_representation)
            {
                self.$el.filter('.web_advanced_search_x2x_domain').text(
                    domain_representation);
                self.domain = domain;
                self.domain_representation = domain_representation;
            });
            popup.select_element(
                this.field.relation, {}, this.field.domain,
                this.field.context);
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

    instance.web_advanced_search_x2x.SelectCreatePopup = instance.web.form.SelectCreatePopup.extend({
        setup_search_view: function()
        {
            var self = this;
            this._super.apply(this, arguments);
            this.searchview.on("search_view_loaded", this, function()
            {
                self.view_list.on("list_view_loaded", self, function()
                {
                    self.$buttonpane.find(".oe_selectcreatepopup-search-create").remove();
                    self.$buttonpane.prepend(
                        jQuery('<button />')
                        .addClass('oe_highlight')
                        .text(instance.web._lt('Use criteria'))
                        .click(self.proxy(self.select_domain))
                    );
                    self.$buttonpane.find(".oe_selectcreatepopup-search-select")
                        .unbind('click')
                        .click(function()
                        {
                            self.select_elements(self.selected_ids)
                            .then(function()
                            {
                                self.destroy();
                            });
                        });
                    self.view_list.select_record = function(index)
                    {
                        self.select_elements([self.view_list.dataset.ids[index]])
                        .then(function()
                        {
                            self.destroy();
                        });
                    };
                });
            });
        },
        select_domain: function()
        {
            var self = this,
                search = this.searchview.build_search_data();
            //TODO: get representation from search view
            self.trigger('domain_selected', search.domain, String(search.domain));
            self.destroy();
         },
        select_elements: function(ids)
        {
            var self = this;
            return this.dataset.name_get(ids).then(function(name_gets)
            {
                var names = _.reduce(name_gets, function(memo, name_get)
                {
                    return memo + (memo ? ', ' : '') + name_get[1];
                }, '');
                self.trigger('domain_selected', [['id', 'in', ids]], names);
            });
        },
    });

    instance.web.search.Advanced.include({
        commit_search: function()
        {
            //the original can only cope with propositions (=domain leaves),
            //so we need to rebuild the domain if one of our CompoundDomains
            //is involved
            var self = this;
            this._super.apply(this, arguments);
            this.view.query.each(function(element)
            {
                if(element.attributes.category != _t("Advanced"))
                {
                    return;
                }
                var has_compound_domain = false,
                    compound_domain = new instance.web.CompoundDomain();
                _.each(element.attributes.values, function(value)
                {
                    if(value.value instanceof instance.web.CompoundDomain)
                    {
                        has_compound_domain = true;
                        _.each(value.value.__domains, function(domain)
                        {
                            compound_domain.add(domain);
                        });
                    }
                    else
                    {
                        compound_domain.add(value.value);
                    }
                })
                if(!has_compound_domain)
                {
                    return;
                }
                self.view.query.remove(element.cid);
                self.view.query.add({
                    category: _t("Advanced"),
                    values: element.attributes.values,
                    field: _.extend(
                        element.attributes.field, {
                            get_domain: function()
                            {
                                return compound_domain.eval();
                            }
                        }),
                });
            });
        },
    })
}

