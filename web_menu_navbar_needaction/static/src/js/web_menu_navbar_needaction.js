//-*- coding: utf-8 -*-
//############################################################################
//
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

openerp.web_menu_navbar_needaction = function(instance)
{
    instance.web.Menu.include({
        init: function()
        {
            var self = this,
                result = this._super.apply(this, arguments);
            this.on('menu_bound', this, function()
            {
                new instance.web.Model('ir.config_parameter')
                    .call('get_param',
                          ['web_menu_navbar_needaction.refresh_timeout'])
                    .then(self.proxy(self.refresh_navbar_needaction))
            });
            return result;
        },
        refresh_navbar_needaction: function(timeout)
        {
            if(timeout)
            {
                setTimeout(this.proxy(this.refresh_navbar_needaction), timeout, timeout);
            }
            return this.load_navbar_needaction();
        },
        load_navbar_needaction: function()
        {
            this.navbar_menu_ids = this.$el.parents('body')
                .find('#oe_main_menu_navbar a[data-menu]')
                .filter(function() { return parseInt(jQuery(this).attr('data-menu')); })
                .map(function() { return parseInt(jQuery(this).attr('data-menu')); })
                .get();
            return new instance.web.Model('ir.ui.menu')
                .call('get_navbar_needaction_data', [this.navbar_menu_ids])
                .then(this.proxy(this.process_navbar_needaction));
        },
        process_navbar_needaction: function(data)
        {
            var self = this;
            _.each(data, function (needaction_count, menu_id)
            {
                var $item = self.$el.parents('body').find(
                    _.str.sprintf('#oe_main_menu_navbar a[data-menu="%s"]',
                                  menu_id));
                if(!$item.length)
                {
                    return;
                }
                $item.find('.badge').remove();
                if(needaction_count)
                {
                    $item.append(
                        instance.web.qweb.render("Menu.needaction_counter",
                        {widget : {needaction_counter: needaction_count}}));
                }
            });
            instance.web.bus.trigger('resize');
        },
    })

    instance.mail.Thread.include({
        message_fetch_set_read: function (message_list)
        {
            this._super.apply(this, arguments);
            return this.render_mutex.exec(function()
            {
                instance.client.menu.refresh_navbar_needaction();
            });
        },
    })
}
