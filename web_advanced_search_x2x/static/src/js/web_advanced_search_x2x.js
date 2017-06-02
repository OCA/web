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
odoo.define('web_advanced_search_x2x.advanced_search', function(require) {
	var core = require('web.core');
	var data = require('web.data');
	var pyeval = require('web.pyeval');
	var session = require('web.session');
	var searchFilters = require('web.search_filters');
	var formCommon = require('web.form_common');
	var relationalFields = require('web.form_relational');
	var searchView = require('web.SearchView');
	var dialog = require('web.Dialog');
	var _t = core._t;

	var ExtendedSearchPropositionMany2One = searchFilters.ExtendedSearchProposition.Char.extend(formCommon.FieldManagerMixin, {
		template : 'web_advanced_search_x2x.extended_search.proposition.many2one',
		searchfield : null,

		init : function() {
			this.operators = _.sortBy(this.operators, function(op) {
				switch (op.value) {
				case '=':
					return -2;
				case '!=':
					return -1;
				default:
					return 0;
				}
			});
			this.operators.push({
				'value' : 'domain',
				'text' : _t('is in selection'),
			});
			return this._super.apply(this, arguments);
		},
		start : function() {
			this.getParent().$('.o_searchview_extended_prop_op').on('change', this.proxy('operator_changed'));
			return this._super.apply(this, arguments).then(this.proxy(this.operator_changed));
		},
		get_field_desc : function() {
			return this.field;
		},
		create_searchfield_node : function() {
			return {
				attrs : {
					name : this.field.name,
					options : '{"no_create": true}',
				},
			};
		},
		create_searchfield : function() {
			if (this.searchfield) {
				this.searchfield.destroy();
			}
			this.searchfield = new relationalFields.FieldMany2One(this, this.create_searchfield_node());
			return this.searchfield;
		},
		operator_changed : function(e) {
			if (this.searchfield) {
				this.searchfield.destroy();
			}
			this.create_searchfield().appendTo(this.$el.empty());
			if (this.show_domain_selection()) {
				$(e.target).after("<span class='web_advanced_search_x2x_domain' /><span class='o_searchview_more fa fa-search mirror'/>")
				this.searchfield.destroy();
				$('span.mirror').click(this.proxy(this.popup_domain_selection));
				this.popup_domain_selection();
			}
		},
		get_operator : function() {
			if (this.isDestroyed()) {
				return false;
			}
			return this.getParent().$('.o_searchview_extended_prop_op').val();
		},
		show_searchfield : function() {
			var operator = this.get_operator();
			return operator == '=' || operator == '!=';
		},
		show_domain_selection : function() {
			return this.get_operator() == 'domain';
		},
		get_value : function() {
			if (this.show_searchfield() && this.searchfield) {
				return this.searchfield.get_value();
			}
			return this._super.apply(this, arguments);
		},
		format_label : function(format, field, operator) {
			var value = null;
			if (this.show_searchfield() && this.searchfield) {
				value = this.searchfield.display_value[String(this.searchfield.get_value())];
			}
			if (this.show_domain_selection() && this.domain_representation) {
				value = this.domain_representation;
			}
			if (value) {
				return _.str.sprintf(format, {
					field : field.string,
					operator : operator.label || operator.text,
					value : value,
				});
			}
			return this._super.apply(this, arguments);
		},
		get_domain : function() {
			if (this.show_domain_selection()) {
				var self = this;
				if (!this.domain || this.domain.length == 0) {
					dialog.alert(null, _t('Invalid search domain'));
				}
				return _.extend(new data.CompoundDomain(), {
					__domains : [ _.map(this.domain, function(leaf) {
						if (_.isArray(leaf) && leaf.length == 3) {
							return [ self.field.name + '.' + leaf[0], leaf[1], leaf[2] ];
						}
						return leaf;
					}), ],
				})
			}
			return this._super.apply(this, arguments);
		},
		popup_domain_selection : function() {
			var self = this, popup = new SelectCreatePopup(this, {
				res_model : this.field.relation,
				domain : this.field.domain,
				context : new data.CompoundContext(session.user_context, this.field.context),
			});
			popup.on('domain_selected', this, function(domain, domain_representation) {
				$('.web_advanced_search_x2x_domain').text(domain_representation);
				self.domain = domain;
				self.domain_representation = domain_representation;
			});
			popup.open();
		},
	});

	core.search_filters_registry.add('one2many', ExtendedSearchPropositionMany2One);
	core.search_filters_registry.add('many2many', ExtendedSearchPropositionMany2One);
	core.search_filters_registry.add('many2one', ExtendedSearchPropositionMany2One);

	var SelectCreatePopup = formCommon.SelectCreateDialog.extend({

		setup : function(search_defaults, fields_views) {
			var self = this;
			return this._super(search_defaults, fields_views).then(
					function(fragment) {
						self.view_list.on("list_view_loaded", self, function() {
							if (self.$footer.find('.o_selectcreatepopup-search-select-domain').length == 0) {
								self.$footer.prepend(jQuery('<button/>').addClass('btn btn-sm btn-primary o_selectcreatepopup-search-select-domain').text(_t('Use criteria')).click(
										self.proxy(self.select_domain)));
								self.$footer.find('.o_selectcreatepopup_search_select').next().remove();
							}
							self.$footer.find('.o_selectcreatepopup-search-select-domain').prop('disabled', self.searchview.build_search_data().domains.length == 0);
							self.$footer.find(".o_selectcreatepopup_search_select").unbind('click').click(function(e) {
								e.stopPropagation();
								self.select_elements(self.selected_ids).then(function() {
									self.destroy();
								});
							});
							self.view_list.select_record = function(index) {
								self.select_elements([ self.view_list.dataset.ids[index] ]).then(function() {
									self.destroy();
								});
							};
						});
						return fragment;
					});
		},

		select_domain : function(domains, contexts, groupbys) {
			var self = this, search = this.searchview.build_search_data();
			var results = pyeval.eval_domains_and_contexts({
				domains : search.domains,
				contexts : search.contexts,
				groupbys : search.groupbys || []
			}).then(function(search) {
				var representation = self.searchview.query.reduce(function(memo, term) {
					return _.str.sprintf('%s%s(%s: %s)', memo, (memo ? ' ' : ''), term.attributes.category, _.reduce(term.get('values'), function(memo, value) {
						return memo + (memo ? ', ' : '') + value.label;
					}, ''));
				}, '');
				self.trigger('domain_selected', search.domain, representation);
				self.destroy();
			})

		},
		select_elements : function(ids) {
			var self = this;
			return this.dataset.name_get(ids).then(function(name_gets) {
				var names = _.reduce(name_gets, function(memo, name_get) {
					return memo + (memo ? ', ' : '') + name_get[1];
				}, '');
				self.trigger('domain_selected', [ [ 'id', 'in', ids ] ], names);
			});
		},
	});

	searchView.include({
		build_search_data : function() {
			// Advanced.commit_search can only cope with propositions
			// (=domain leaves),
			// so we need to rebuild the domain if one of our CompoundDomains
			// is involved
			var result = this._super.apply(this, arguments);
			_.each(result.domains, function(domain, index) {
				if (!_.isArray(domain)) {
					return;
				}
				var compound_domains = [], leaves = [];
				_.each(domain, function(leaf) {
					if (leaf instanceof data.CompoundDomain) {
						compound_domains.push(leaf);
					}
					if (_.isArray(leaf)) {
						leaves.push(leaf);
					}
				});
				if (compound_domains.length) {
					var combined = new data.CompoundDomain();
					_.each(compound_domains, function(domain) {
						combined.add(domain.eval());
					})
					_.each(leaves, function(leaf) {
						combined.add([ leaf ]);
					});
					result.domains[index] = combined;
				}
			});
			return result;
		},
	});
});
