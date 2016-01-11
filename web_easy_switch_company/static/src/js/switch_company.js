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
    var UserMenu = require('web.UserMenu')
    var SystrayMenu = require('web.SystrayMenu');
    var SwitchCompanyWidget = require("web.SwitchCompanyWidget")

    /***************************************************************************
    * Extend 'UserMenu' Widget to insert a 'SwitchCompanyWidget' widget on the
    * dashboard view
    ***************************************************************************/
    var UserMenu = UserMenu.include({

        start: function(parent) {
            var self = this
            this._super(parent);
            var webclient = this.getParent().getParent();

            var switch_button = new SwitchCompanyWidget(self);
            var systray = self.$el.parent('ul')
            var li = $('<li />')
            li.appendTo(systray)
            switch_button.appendTo(li)
        }

    });

    // Add to systray on usual screens
    SystrayMenu.Items.push(SwitchCompanyWidget)
})
