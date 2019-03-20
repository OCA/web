/**********************************************************************************
*
*    Copyright (c) 2017-2019 MuK IT GmbH.
*
*    This file is part of MuK Search Panel 
*    (see https://mukit.at).
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Lesser General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Lesser General Public License for more details.
*
*    You should have received a copy of the GNU Lesser General Public License
*    along with this program. If not, see <http://www.gnu.org/licenses/>.
*
**********************************************************************************/

odoo.define('muk_web_searchpanel.KanbanController', function (require) {
"use strict";

var core = require('web.core');
var session = require('web.session');
var view_dialogs = require('web.view_dialogs');
var viewUtils = require('web.viewUtils');

var Domain = require('web.Domain');
var Context = require('web.Context');
var KanbanController = require('web.KanbanController');

var _t = core._t;
var QWeb = core.qweb;

KanbanController.include({
    custom_events: _.extend({}, KanbanController.prototype.custom_events, {
        search_panel_domain_updated: '_onSearchPanelDomainUpdated',
    }),
    init: function (parent, model, renderer, params) {
    	this._super.apply(this, arguments);
    	this._searchPanel = params.searchPanel;
        this.controlPanelDomain = params.controlPanelDomain || [];
        this.searchPanelDomain = this._searchPanel ? this._searchPanel.getDomain() : [];
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
        params.domain = this.controlPanelDomain.concat(this.searchPanelDomain);
        var superProm = this._super.apply(this, arguments);
        var searchPanelProm = this._updateSearchPanel();
        return $.when(superProm, searchPanelProm).then(function () {
            return self.renderer.render();
        });
    },
    _updateSearchPanel: function () {
        return this._searchPanel.update({searchDomain: this.controlPanelDomain});
    },
    _onSearchPanelDomainUpdated: function (ev) {
        this.searchPanelDomain = ev.data.domain;
        this.reload({offset: 0});
    },
});

});
