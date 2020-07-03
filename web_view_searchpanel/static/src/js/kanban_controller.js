/**
*
*    Copyright 2017-2019 MuK IT GmbH.
*    License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*
**/

odoo.define('web_view_searchpanel.KanbanController', function (require) {
    "use strict";
    var KanbanController = require('web.KanbanController');

    KanbanController.include({
        custom_events: _.extend({}, KanbanController.prototype.custom_events, {
            search_panel_domain_updated: '_onSearchPanelDomainUpdated',
        }),
        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            this._searchPanel = params.searchPanel;
            this.controlPanelDomain = params.controlPanelDomain || [];
            this.searchPanelDomain = this._searchPanel ?
                this._searchPanel.getDomain() : [];
        },
        start: function () {
            if (this._searchPanel) {
                this.$el.addClass('o_kanban_with_searchpanel');
                this.$el.prepend(this._searchPanel.$el);
            }
            return this._super.apply(this, arguments);
        },
        update: function (params) {
            if (!this._searchPanel) {
                return this._super.apply(this, arguments);
            }
            var self = this;
            if (params.domain) {
                this.controlPanelDomain = params.domain;
            }
            params.noRender = true;
            params.domain = this.controlPanelDomain.concat(
                this.searchPanelDomain);
            var superProm = this._super.apply(this, arguments);
            var searchPanelProm = this._updateSearchPanel();
            return $.when(superProm, searchPanelProm).then(function () {
                return self.renderer.render();
            });
        },
        _updateSearchPanel: function () {
            return this._searchPanel.update({
                searchDomain: this.controlPanelDomain,
            });
        },
        _onSearchPanelDomainUpdated: function (ev) {
            this.searchPanelDomain = ev.data.domain;
            this.reload({offset: 0});
        },
    });

});
