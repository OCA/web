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

openerp.advanced_filters = function(instance)
{
    var _t = instance.web._t;

    instance.web.Sidebar.include({
        init: function()
        {
            var result = this._super.apply(this, arguments);
            this.sections.push({
                'name': 'advanced_filters',
                'label': _t('Advanced filters'),
            });
            this.items.advanced_filters = [];
            return result;
        },
    });
    instance.web.ListView.include({
        do_select: function (ids, records)
        {
            var result = this._super(this, arguments);
            this.advanced_filters_show(ids);
            return result;
        },
        load_list: function(data)
        {
            var result = this._super.apply(this, arguments),
                self = this;
            if(!this.sidebar || this.sidebar.items.advanced_filters.length)
            {
                this.advanced_filters_show([]);
                return result;
            }
            this.sidebar.add_items(
                'advanced_filters',
                [
                    {
                        label: _t('Whole selection (criteria)'),
                        classname: 'oe_advanced_filters_header',
                    },
                    {
                        label: _t('To existing filter'),
                        callback: function (item)
                        {
                            self.advanced_filters_combine_with_existing.apply(
                                self, ['union', 'domain', item]);
                        },
                    },
                    {
                        label: _t('Remove from existing filter'),
                        callback: function (item)
                        {
                            self.advanced_filters_combine_with_existing.apply(
                                self, ['complement', 'domain', item]);
                        },
                    },
                    {
                        label: _t('Marked records'),
                        classname: 'oe_advanced_filters_header',
                    },
                    {
                        label: _t('To new filter'),
                        callback: function ()
                        {
                            self.advanced_filters_save_selection.apply(
                                self, arguments);
                        },
                    },
                    {
                        label: _t('To existing filter'),
                        callback: function (item)
                        {
                            self.advanced_filters_combine_with_existing.apply(
                                self, ['union', 'ids', item]);
                        },
                    },
                    {
                        label: _t('Remove from existing filter'),
                        callback: function (item)
                        {
                            self.advanced_filters_combine_with_existing.apply(
                                self, ['complement', 'ids', item]);
                        },
                    },
                 ]
            );
            this.do_select([], []);
            return result;
        },
        advanced_filters_show: function(ids)
        {
            if(this.sidebar)
            {
                this.sidebar.$el.show();
                this.sidebar.$el.children().children().each(function(i, e)
                {
                    $e = jQuery(e)
                    if($e.find('li.oe_advanced_filters_header').length)
                    {
                        $e.find('a[data-index="3"],a[data-index="4"],' +
                                'a[data-index="5"],a[data-index="6"]')
                            .parent().toggle(ids.length > 0);
                    }
                    else
                    {
                        $e.toggle(ids.length > 0);
                    }
                });
            }
        },
        advanced_filters_save_selection: function(item)
        {
            var self = this;
            this.do_action({
                name: item.label,
                type: 'ir.actions.act_window',
                res_model: 'ir.filters',
                views: [[false, 'form']],
                target: 'new',
                context: {
                    default_model_id: this.dataset._model.name,
                    default_domain: JSON.stringify(
                        [
                            ['id', 'in', this.groups.get_selection().ids],
                        ]
                    ),
                    default_context: JSON.stringify({}),
                    form_view_ref: 'advanced_filters.form_ir_filters_save_new',
                },
            },
            {
                on_close: function()
                {
                    self.ViewManager.setup_search_view(
                        self.ViewManager.searchview.view_id,
                        self.ViewManager.searchview.defaults);
                },
            });
        },
        advanced_filters_combine_with_existing: function(action, type, item)
        {
            var search = this.ViewManager.searchview.build_search_data(),
                self = this;
            instance.web.pyeval.eval_domains_and_contexts({
                domains: search.domains,
                contexts: search.contexts,
                group_by_seq: search.groupbys || []
            }).done(function(search)
            {
                var domain = [], ctx = {};
                switch(type)
                {
                    case 'domain':
                        domain = search.domain;
                        ctx = search.context;
                        _(_.keys(instance.session.user_context)).each(
                            function (key) {delete ctx[key]});
                        break;
                    case 'ids':
                        domain = [
                            ['id', 'in', self.groups.get_selection().ids],
                        ]
                        ctx = {};
                        break;
                }
                self.do_action({
                    name: item.label,
                    type: 'ir.actions.act_window',
                    res_model: 'ir.filters.combine.with.existing',
                    views: [[false, 'form']],
                    target: 'new',
                    context: _.extend({
                        default_model: self.dataset._model.name,
                        default_domain: JSON.stringify(domain),
                        default_action: action,
                        default_context: JSON.stringify(ctx),
                    },
                    self.dataset.context.default_filter_id ? {
                        default_filter_id:
                           self.dataset.context.default_filter_id,
                    } : {}),
                },
                {
                    on_close: function()
                    {
                        self.ViewManager.setup_search_view(
                            self.ViewManager.searchview.view_id,
                            self.ViewManager.searchview.defaults);
                    },
                });
            });
        },
    });
}
