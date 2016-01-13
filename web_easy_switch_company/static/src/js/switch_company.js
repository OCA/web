/******************************************************************************
    Web Easy Switch Company module for OpenERP
    Copyright (C) 2014 GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/
odoo.define('web_easy_switch_company', function (require) {
    var UserMenu = require('web.UserMenu');
    var SystrayMenu = require('web.SystrayMenu');
    var SwitchCompanyWidget = require("web.SwitchCompanyWidget");
    var Model = require('web.DataModel');

    var web_client = require('web.web_client');
    var session = require('web.session');
    var core = require('web.core');

    /***************************************************************************
    * Extend 'UserMenu' Widget to insert a 'SwitchCompanyWidget' widget on the
    * dashboard view
    ***************************************************************************/
    var UserMenu = UserMenu.include({

        start: function(parent) {
            /*
            * Add the switch button to the user menu for odoo enterprise
            */
            var self = this;
            this._super(parent);

            var menu = self.$el.parent('ul');

            if (!menu.next().hasClass('oe_systray')) {
              var switch_button = new SwitchCompanyWidget(self);
              self.switch_company = switch_button;
              switch_button.prependTo(menu);
            }
        },

        do_update: function () {
          /*
          * Prevent the company name to appear twice in the user name field
          */
          var self = this;
          self._super();

          var fct = function () {
            if (!session.uid)
                return;

            var func = new Model("res.users").get_func("read");

            return self.alive(func(session.uid, ["name", "company_id"])).then(function(res) {
                var topbar_name = res.name;

                if(session.debug)
                    topbar_name = _.str.sprintf("%s (%s)", topbar_name, session.db);

                self.$el.find('.oe_topbar_name').text(topbar_name);

                core.bus.trigger('resize');  // Re-trigger the reflow logic
            })
  
          }

          this.update_promise = this.update_promise.then(fct, fct);
        }
    });

    // Add to systray on usual screens
    SystrayMenu.Items.push(SwitchCompanyWidget);
})
