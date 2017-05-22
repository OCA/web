/* Copyright 2016 Therp BV, ICTSTUDIO
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

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
            if(this.searchfield.field.domain)
            {
                try
                {
                    // if this is a domain that depends on values we don't have
                    // remove it
                    jQuery.parseJSON(this.searchfield.field.domain);
                }
                catch(error)
                {
                    this.searchfield.field.domain = [];
                }
            }
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
                    throw new instance.web.search.Invalid(
                        this.field.string, this.domain_representation,
                        instance.web._lt('invalid search domain'));
                }
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
                new instance.web.CompoundContext(
                    instance.session.user_context, this.field.context));
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
                        jQuery('<button/>')
                        .addClass('oe_highlight')
                        .addClass('oe_selectcreatepopup-search-select-domain')
                        .text(instance.web._lt('Use criteria'))
                        .click(self.proxy(self.select_domain))
                    );
                    self.$buttonpane.find('.oe_selectcreatepopup-search-select-domain')
                        .prop('disabled', self.searchview.build_search_data().domains.length == 0);
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
            instance.web.pyeval.eval_domains_and_contexts({
                domains: search.domains,
                contexts: search.contexts,
                groupbys: search.groupbys || []
            }).then(function(search)
            {
                var representation = self.searchview.query.reduce(function(memo, term)
                {
                    return _.str.sprintf(
                        '%s%s(%s: %s)', memo, (memo ? ' ' : ''),
                        term.attributes.category,
                        _.reduce(term.get('values'), function(memo, value)
                        {
                            return memo + (memo ? ', ' : '') + value.label;
                        }, ''));
                }, '');
                self.trigger('domain_selected', search.domain, representation);
                self.destroy();
            })
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

    instance.web.SearchView.include({
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
                    if(leaf instanceof instance.web.CompoundDomain)
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
                    var combined = new instance.web.CompoundDomain();
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
}

