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

openerp.web_menu_autohide = function(instance)
{
    instance.web.WebClient.include({
        show_bar_threshold_navbar: 10,
        show_bar_threshold_leftbar: 10,
        hide_delay_navbar: 10000,
        hide_delay_leftbar: 10000,
        leftbar_hide_timeout_id: null,
        main_menu_hide_timeout_id: null,
        navbar_query: '#oe_main_menu_navbar',
        leftbar_query: '.oe_leftbar',
        start: function()
        {
            var self = this;
            return this._super.apply(this, arguments)
            .then(function()
            {
                var addon_name = 'web_menu_autohide',
                    parameters = _.map(
                        ['show_bar_threshold_navbar', 'hide_delay_navbar',
                         'show_bar_threshold_leftbar', 'hide_delay_leftbar',
                        ],
                        function(a) { return addon_name + '.' + a });
                return (new openerp.web.Model('ir.config_parameter'))
                .query(['key', 'value'])
                .filter([['key', 'in', parameters]])
                .all()
                .then(function(params)
                {
                    _.each(params, function(param)
                    {
                        self[param.key.replace(addon_name + '.', '')] =
                            parseInt(param.value);
                    });
                });
            })
            .then(function()
            {
                if(self.hide_delay_navbar)
                {
                    jQuery('.openerp.openerp_webclient_container')
                        .css('height', '100%');
                    jQuery(self.navbar_query)
                        .css({
                            position: 'absolute',
                            left: '0px',
                            right: '0px',
                            top: '0px',
                            'z-index': 1110
                        });
                }
                if(self.hide_delay_leftbar)
                {
                    jQuery(self.leftbar_query)
                        .css({
                            display: 'block',
                            position: 'absolute',
                            left: '0px',
                            top: '0px',
                            bottom: '0px',
                            'z-index': 1110,
                            width: 'auto',
                        });
                    jQuery('.openerp .oe_leftbar > div')
                        .css('width', 'auto');
                }
                if(self.hide_delay_navbar || self.hide_delay_leftbar)
                {
                    self.$el
                    .bind('mousemove', _.bind(self.on_mousemove, self))
                    .bind('click', _.bind(self.on_click, self));
                }
            })
        },
        show_application: function()
        {
            this._super.apply(this, arguments);
            openerp.client.toggle_main_menu(false, this.hide_delay_navbar);
        },
        toggle_bars: function(hide)
        {
            this.toggle_main_menu(hide);
            this.toggle_left_bar(hide);
        },
        toggle_menu_element: function(selector, timeout_id, show, delay)
        {
            if(this[timeout_id])
            {
                clearTimeout(this[timeout_id]);
                this[timeout_id] = null;
            }
            if(delay)
            {
                this[timeout_id] = setTimeout(
                    _.bind(
                        this.toggle_menu_element, this,
                        selector, timeout_id, show),
                    delay);
            }
            else
            {
                this.$(selector).toggle(show);
            }
        },
        toggle_main_menu: function(show, delay)
        {
            if(!this.hide_delay_navbar)
            {
                return;
            }
            this.toggle_menu_element(
                this.navbar_query, 'main_menu_hide_timeout_id', show,
                delay);
        },
        toggle_left_bar: function(show, delay)
        {
            if(!this.hide_delay_leftbar)
            {
                return;
            }
            this.toggle_menu_element(
                this.leftbar_query, 'leftbar_hide_timeout_id', show, delay);
        },
        on_click: function(e)
        {
            var on_main_menu = jQuery(e.target)
                .parents(this.navbar_query).length > 0,
                on_left_bar = jQuery(e.target)
                .parents(this.leftbar_query).length > 0;
            if(!on_left_bar && !on_main_menu && openerp.client.leftbar_hide_timeout_id)
            {
                clearTimeout(openerp.client.leftbar_hide_timeout_id);
                openerp.client.leftbar_hide_timeout_id = null;
                this.toggle_left_bar(false);
            }
        },
        on_mousemove: function(e)
        {
            var on_main_menu = jQuery(e.target)
                .parents(this.navbar_query).length > 0,
                on_left_bar = jQuery(e.target)
                .parents(this.leftbar_query).length > 0;
            if(on_left_bar && openerp.client.leftbar_hide_timeout_id)
            {
                clearTimeout(openerp.client.leftbar_hide_timeout_id);
                openerp.client.leftbar_hide_timeout_id = null;
            }
            if(on_main_menu && openerp.client.main_menu_hide_timeout_id)
            {
                clearTimeout(openerp.client.main_menu_hide_timeout_id);
                openerp.client.main_menu_hide_timeout_id = null;
            }
            if(!on_left_bar && !openerp.client.leftbar_hide_timeout_id)
            {
                this.toggle_left_bar(false, openerp.client.hide_delay_leftbar);
            }
            if(!on_main_menu && !openerp.client.main_menu_hide_timeout_id)
            {
                this.toggle_main_menu(false);
            }
            if(e.pageX < this.show_bar_threshold_leftbar)
            {
                this.toggle_left_bar(true);
            }
            if(e.pageY < this.show_bar_threshold_navbar)
            {
                this.toggle_main_menu(true);
            }
        },
    });
    instance.web.Menu.include({
        close_leftbar: false,
        start: function()
        {
            this.on('menu_click', this, this.on_menu_click_with_action);
            openerp.client.toggle_left_bar(false, openerp.client.hide_delay_leftbar);
            return this._super.apply(this, arguments);
        },
        on_menu_click_with_action: function(menu, $element)
        {
            //close if it's not a menu containing other menus
            this.close_leftbar = (
                $element.parents(openerp.client.leftbar_query).length == 0 &&
                $element.parent().children('ul').length == 0
            );
        },
        open_menu: function()
        {
            this._super.apply(this, arguments);
            if(this.close_leftbar)
            {
                openerp.client.toggle_left_bar(false);
            }
            this.close_leftbar = false;
        },
    });
}
