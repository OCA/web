/*
Copyright (C) 2010-2013 OpenERP s.a. (<http://www.openerp.com>)
Copyright (C) 2014 initOS GmbH & Co. KG (<http://initos.com>)
Copyright (C) 2018 Iván Todorovich (<ivan.todorovich@gmail.com>)
Copyright (C) 2019-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('web_dashboard_tile', function (require) {
   'use strict';
    var core = require('web.core');
    var FavoriteMenu = require('web.FavoriteMenu');
    var Domain = require('web.Domain');
    var qweb = core.qweb;
    var _t = core._t;

    FavoriteMenu.include({

        start: function () {
            var self = this;
            if (this.action_id === undefined) {
                return this._super();
            }
            if (this.action.type === 'ir.actions.act_window') {
                this.add_to_dashboard_available = true;
                this.$('.o_favorites_menu').append(qweb.render('SearchView.addtodashboardtile'));
                this.$add_to_dashboard_tile = this.$('.o_add_to_dashboard_tile');
                this.$add_to_dashboard_tile_name = this.$('.o_add_to_dashboard_tile_name')[0];

                // Add event on button and link clicks
                this.$add_to_dashboard_tile_link = this.$('.o_add_to_dashboard_tile_link');
                this.$add_to_dashboard_tile_link.click(function (e) {
                    e.preventDefault();
                    self._toggleDashboardTileMenu();
                });
                this.$add_to_dashboard_tile_button = this.$('.o_add_to_dashboard_tile_button');
                this.$add_to_dashboard_tile_button.click(this.proxy('_addDashboardTile'));

                // Add categories to the select list
                this.$add_to_dashboard_tile_category = this.$('.o_add_to_dashboard_tile_category')[0];
                this._rpc({
                    model: 'tile.category',
                    method: 'search_read',
                    args: [[], ['id', 'name']],
                }).then(function (res) {
                    res.forEach(function(item){
                        var newOption = document.createElement("option");
                        newOption.text = item.name;
                        newOption.value = item.id;
                        self.$add_to_dashboard_tile_category.appendChild(newOption);
                    });
                });
            }
            return this._super();
        },

        _toggleDashboardTileMenu: function (isOpen) {
            this.$add_to_dashboard_tile_link
                .toggleClass('o_closed_menu', !(_.isUndefined(isOpen)) ? !isOpen : undefined)
                .toggleClass('o_open_menu', isOpen);
            this.$add_to_dashboard_tile.toggle(isOpen);
            if (this.$add_to_dashboard_tile_link.hasClass('o_open_menu')) {
                this.$add_to_dashboard_tile_name.focus();
            }
        },

        _addDashboardTile: function () {
            var self = this;
            var tile_name = this.$add_to_dashboard_tile_name.value;
            var tile_category_id = this.$add_to_dashboard_tile_category.value;

            if (!tile_name.length){
                this.do_warn(_t("Error"), _t("Name Field is required."));
                this.$add_to_dashboard_tile_name.focus();
                return;
            }

            var search_data = this.searchview.build_search_data();
            var domain = this.action.domain ? this.action.domain.slice(0) : [];

            _.each(search_data.domains, function (d) {
                domain.push.apply(domain, Domain.prototype.stringToArray(d));
            });

            return this._rpc({
                route: '/web_dashboard_tile/create_tile',
                params: {
                    model_name: self.action.res_model,
                    name: tile_name,
                    category_id: tile_category_id,
                    domain: domain,
                    action_id: this.action_id,
                },
            }).then(function (res) {
                if (res) {
                    self.do_notify(
                        _.str.sprintf(_t("'%s' added to the overview dashboard"), tile_name),
                        _t('Please refresh your browser for the changes to take effect.')
                    );
                self._toggleDashboardTileMenu(false);
                } else {
                    self.do_warn(_t("Could not add new element to the overview dashboard"));
                }
            });

        },

    });

});
