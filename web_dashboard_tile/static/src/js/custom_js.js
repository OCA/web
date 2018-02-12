//  @@@ web_dashboard_tile custom JS @@@
//#############################################################################
//    
//    Copyright (C) 2010-2013 OpenERP s.a. (<http://www.openerp.com>)
//    Copyright (C) 2014 initOS GmbH & Co. KG (<http://initos.com>)
//    Copyright (C) 2018 Iván Todorovich (<ivan.todorovich@gmail.com>)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//#############################################################################

odoo.define('web_dashboard_tile', function (require) {
"use strict";

var core = require('web.core');
var data = require('web.data');
var FavoriteMenu = require('web.FavoriteMenu');
var ActionManager = require('web.ActionManager');
var ViewManager = require('web.ViewManager');
var Model = require('web.DataModel');
var session = require('web.session');
var pyeval = require('web.pyeval');
var _t = core._t;
var QWeb = core.qweb;


FavoriteMenu.include({

    prepare_dropdown_menu: function (filters) {
        var self = this;
        this._super(filters);
        var am = this.findAncestor(function (a) {
            return a instanceof ActionManager;
        });
        if (am && am.get_inner_widget() instanceof ViewManager) {
            this.view_manager = am.get_inner_widget();
            this.add_to_dashboard_tile_available = true;
            this.$('.o_favorites_menu').append(QWeb.render('SearchView.addtodashboardtile'));
            this.$add_to_dashboard_tile = this.$('.o_add_to_dashboard_tile');
            this.$add_dashboard_tile_btn = this.$add_to_dashboard_tile.eq(1).find('button');
            this.$add_dashboard_tile_input = this.$add_to_dashboard_tile.eq(0).find('input');
            this.$add_dashboard_tile_link = this.$('.o_add_to_dashboard_tile_link');
            var title = this.searchview.get_title();
            this.$add_dashboard_tile_input.val(title);
            this.$add_dashboard_tile_link.click(function (e) {
                e.preventDefault();
                self.toggle_dashboard_tile_menu();
            });
            this.$add_dashboard_tile_btn.click(this.proxy('add_dashboard_tile'));
        }
    },

    toggle_dashboard_tile_menu: function (is_open) {
        this.$add_dashboard_tile_link
            .toggleClass('o_closed_menu', !(_.isUndefined(is_open)) ? !is_open : undefined)
            .toggleClass('o_open_menu', is_open);
        this.$add_to_dashboard_tile.toggle(is_open);
        if (this.$add_dashboard_tile_link.hasClass('o_open_menu')) {
            this.$add_dashboard_tile_input.focus();
        }
    },

    close_menus: function () {
        if (this.add_to_dashboard_tile_available) {
            this.toggle_dashboard_tile_menu(false);
        }
        this._super();
    },

    add_dashboard_tile: function () {
        var self = this;

        var search_data = this.searchview.build_search_data(),
            context = new data.CompoundContext(this.searchview.dataset.get_context() || []),
            domain = new data.CompoundDomain(this.searchview.dataset.get_domain() || []);
        _.each(search_data.contexts, context.add, context);
        _.each(search_data.domains, domain.add, domain);

        context.add({
            group_by: pyeval.eval('groupbys', search_data.groupbys || [])
        });

        context.add(this.view_manager.active_view.controller.get_context());

        var c = pyeval.eval('context', context);
        for(var k in c) {
            if (c.hasOwnProperty(k) && /^search_default_/.test(k)) {
                delete c[k];
            }
        }

        this.toggle_dashboard_tile_menu(false);

        c.dashboard_merge_domains_contexts = false;
        var d = pyeval.eval('domain', domain),
            tile = new Model('tile.tile'),
            name = self.$add_dashboard_tile_input.val();

        var private_filter = !this.$('#oe_searchview_custom_public').prop('checked');
        if (_.isEmpty(name)){
            this.do_warn(_t("Error"), _t("Filter name is required."));
            return false;
        }
        
        // Don't save user_context keys in the custom filter, otherwise end
        // up with e.g. wrong uid or lang stored *and used in subsequent
        // reqs*
        var ctx = context;
        _(_.keys(session.user_context)).each(function (key) {
            delete ctx[key];
        });

        var vals = {
            name: name,
            user_id: private_filter ? session.uid : false,
            model_id: self.view_manager.active_view.controller.model,
            //context: context,
            domain: d,
            action_id: self.action_id || false,
        };

        // FIXME: current context?
        return tile.call('add', [vals]).done(function (id) {
            self.do_notify(_t("Success"), _t("Tile is created"));
        });
    },
});

});

