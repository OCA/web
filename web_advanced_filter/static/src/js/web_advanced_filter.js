// Copyright 2014-2020 Therp BV <https://therp.nl>
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
odoo.define('web_advanced_filter', function(require) {
var core = require('web.core'),
    _t = core._t,
    QWeb = core.qweb,
    data_manager = require('web.data_manager'),
    DropdownMenu = require('web.DropdownMenu'),
    FavoriteMenu = require('web.FavoriteMenu'),
    pyUtils = require('web.py_utils'),
    SearchView = require('web.SearchView'),

AdvancedFiltersMenu = DropdownMenu.extend({
    init: function (parent) {
        this._super(
            parent, this._advanced_filter_header(),
            this._advanced_filter_items()
        );
        this.search_view = parent;
        this.action_manager = this.search_view.getParent();
        this.action_manager
            .on('switch_view', this, this._advanced_filter_update);
        this.action_manager
            .on('selection_changed', this, this._advanced_filter_update);
        this.action_manager.on('search', this, this._advanced_filter_update);
    },
    start: function () {
        this._super.apply(this, arguments);
        this.$menu.addClass('o_advanced_filter_menu');
        this._advanced_filter_update();
    },
    _onItemClick: function (event) {
        event.preventDefault();
        event.stopPropagation();
        var itemId = $(event.currentTarget).data('id'),
            item = _.findWhere(this.items, {itemId: itemId});

        if (item && item.callback) {
            item.callback.apply(this, [item]);
        }
    },
    _advanced_filter_header: function () {
        return {
            category: 'advanced_filters',
            title: _t('Advanced filters'),
            icon: 'fa fa-cubes',
            symbol:
            this.isMobile ? 'fa fa-chevron-right float-right mt4' : false,
        };
    },
    _advanced_filter_items: function () {
        return [
            {
                itemId: 'domain-header',
                description: _t('Search query'),
            },
            {
                itemId: 'domain-new',
                description: _t('To new filter'),
                callback: this._advanced_filters_save_criteria,
            },
            {
                itemId: 'domain-union',
                description: _t('Add to existing filter'),
                callback: this._advanced_filters_combine_with_existing.bind(
                    this, 'union', 'domain'
                ),
            },
            {
                itemId: 'domain-complement',
                description: _t('Subtract from existing filter'),
                callback: this._advanced_filters_combine_with_existing.bind(
                    this, 'complement', 'domain'
                ),
            },
            {
                itemId: 'ids-header',
                description: _t('Marked records'),
            },
            {
                itemId: 'ids-new',
                description: _t('To new filter'),
                callback: this._advanced_filters_save_selection,
            },
            {
                itemId: 'ids-union',
                description: _t('Add to existing filter'),
                callback: this._advanced_filters_combine_with_existing.bind(
                    this, 'union', 'ids'
                ),
            },
            {
                itemId: 'ids-complement',
                description: _t('Subtract from existing filter'),
                callback: this._advanced_filters_combine_with_existing.bind(
                    this, 'complement', 'ids'
                ),
            },
        ]
    },
    _advanced_filters_save_criteria: function(item)
    {
        var search_data = this.search_view.build_search_data(),
            search = pyUtils.eval_domains_and_contexts({
                domains: search_data.domains,
                contexts: search_data.contexts,
                group_by_seq: search_data.groupbys || []
            }),
            ctx = search.context;
        return this.do_action({
            name: item.description,
            type: 'ir.actions.act_window',
            res_model: 'ir.filters',
            views: [[false, 'form']],
            target: 'new',
            context: {
                default_model_id: this.search_view.dataset._model.name,
                default_domain: JSON.stringify(search.domain),
                default_context: JSON.stringify(ctx),
                default_user_id: false,
                form_view_ref: 'web_advanced_filter.form_ir_filters_save_new',
            },
        },
        {
            on_close: this.search_view._reloadFilters.bind(this.search_view),
        });
    },
    _advanced_filters_save_selection: function(item)
    {
        var controller = this.action_manager.getCurrentController(),
            widget = controller.widget,
            ids = widget.getSelectedIds && widget.getSelectedIds() || [];
        this.do_action({
            name: item.description,
            type: 'ir.actions.act_window',
            res_model: 'ir.filters',
            views: [[false, 'form']],
            target: 'new',
            context: {
                default_model_id: this.search_view.dataset._model.name,
                default_domain: JSON.stringify([['id', 'in', ids]]),
                default_context: JSON.stringify({}),
                default_user_id: false,
                form_view_ref: 'web_advanced_filter.form_ir_filters_save_new',
            },
        },
        {
            on_close: this.search_view._reloadFilters.bind(this.search_view),
        });
    },
    _advanced_filters_combine_with_existing: function(action, type, item)
    {
        var search_data = this.search_view.build_search_data(),
            search = pyUtils.eval_domains_and_contexts({
                domains: search_data.domains,
                contexts: search_data.contexts,
                group_by_seq: search_data.groupbys || []
            }),
            domain = [], ctx = {};
        switch(type)
        {
            case 'domain':
                domain = search.domain;
                ctx = search.context;
                break;
            case 'ids':
                var controller = this.action_manager.getCurrentController(),
                    widget = controller.widget;
                domain = [[
                    'id', 'in',
                    widget.getSelectedIds && widget.getSelectedIds() || [],
                ]]
                ctx = {};
                break;
        }
        this.do_action({
            name: item.description,
            type: 'ir.actions.act_window',
            res_model: 'ir.filters.combine.with.existing',
            views: [[false, 'form']],
            target: 'new',
            context: {
                default_model: this.search_view.dataset._model.name,
                default_domain: JSON.stringify(domain),
                default_action: action,
                default_context: JSON.stringify(ctx),
                default_filter_id:
                this.search_view.dataset.context.default_filter_id || false,
            },
        },
        {
            on_close: this.search_view._reloadFilters.bind(this.search_view),
        });
    },
    _advanced_filter_update: function(event) {
        var show_ids = false,
            show_domain = this.search_view.query.length > 0;

        switch ((event || {}).name) {
            case 'selection_changed':
                show_ids = event.data.selection.length > 0;
            break;
            case 'search':
                show_domain = event.data.domains.length > 0;
            break;
        }
        this.$menu.children('.o_menu_item[data-id^="ids-"]')
            .toggle(show_ids);
        this.$menu.children('.o_menu_item[data-id^="domain-"]')
            .toggle(show_domain);
        this.$dropdownReference.toggle(show_ids || show_domain);
    },
});

SearchView.include({

    start: function () {
        var self = this;
        return this._super.apply(this, arguments).then(function () {
            self.advanced_filters_menu = self._createAdvancedFiltersMenu();
            return self.advanced_filters_menu.insertBefore(
                self.favorite_menu.$el
            );
        });
    },

    _createAdvancedFiltersMenu: function () {
        return new AdvancedFiltersMenu(this);
    },

    _reloadFilters: function () {
        if (this.options.disable_favorites) {
            return;
        }
        var self = this;
        data_manager._invalidate(
            data_manager._cache.filters,
            data_manager._gen_key(this.dataset.model, this.action.id)
        );
        this.loadFilters(this.dataset, this.action.id)
        .then(function (filters) {
            self.favorite_filters = filters;
            var favorite_menu = new FavoriteMenu(
                self, self.query, self.dataset.model, self.action,
                self.favorite_filters
            );
            favorite_menu.replace(self.favorite_menu.$el);
            self.favorite_menu = favorite_menu;
        });
    },
});

return {
    AdvancedFiltersMenu: AdvancedFiltersMenu,
}
});
