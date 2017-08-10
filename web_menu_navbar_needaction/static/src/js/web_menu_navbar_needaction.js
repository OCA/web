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
                    .then(self.proxy(self.set_interval_navbar_needaction))
            });
            return result;
        },
        set_interval_navbar_needaction: function(timeout)
        {
            if(timeout)
            {
                this.navbar_needaction_timer = setInterval(
                    this.proxy(this.load_navbar_needaction), timeout
                );
            }
            return this.load_navbar_needaction();
        },
        clear_interval_navbar_needaction: function(error, ev)
        {
            clearInterval(this.navbar_needaction_timer);
            ev.preventDefault();
        },
        load_navbar_needaction: function()
        {
            this.navbar_menu_ids = this.$el.parents('body')
                .find('#oe_main_menu_navbar a[data-menu]')
                .filter(function() { return parseInt(jQuery(this).attr('data-menu')); })
                .map(function() { return parseInt(jQuery(this).attr('data-menu')); })
                .get();
            return new instance.web.Model('ir.ui.menu')
                .call('get_navbar_needaction_data', [this.navbar_menu_ids],
                      {}, {shadow: true})
                .then(this.proxy(this.process_navbar_needaction))
                .fail(this.proxy(this.clear_interval_navbar_needaction));
        },
        process_navbar_needaction: function(data)
        {
            var self = this;
            _.each(data, function (needaction_data, menu_id)
            {
                var $item = self.$el.parents('body').find(
                    _.str.sprintf('#oe_main_menu_navbar a[data-menu="%s"]',
                                  menu_id));
                if(!$item.length || _.isEmpty(needaction_data))
                {
                    return;
                }
                $item.find('.badge').remove();
                if(needaction_data.count)
                {
                    var $counter = jQuery(
                            instance.web.qweb.render("Menu.needaction_counter",
                            {
                                widget: {
                                    needaction_counter: needaction_data.count,
                                }
                            }))
                        .appendTo($item);
                    if(needaction_data.action_id)
                    {
                        $counter.click(function(ev)
                        {
                            var parent = self.getParent();
                            ev.stopPropagation();
                            ev.preventDefault();
                            return parent.menu_dm.add(
                                self.rpc('/web/action/load', {
                                action_id: needaction_data.action_id,
                            }))
                            .then(function(action)
                            {
                                return parent.action_mutex.exec(function()
                                {
                                    action.domain = needaction_data.action_domain;
                                    action.context = new instance.web.CompoundContext(
                                        action.context || {}
                                    );
                                    action.context = instance.web.pyeval.eval(
                                        'context', action.context
                                    );
                                    _.each(_.keys(action.context), function(key)
                                    {
                                        if(key.startsWith('search_default'))
                                        {
                                            delete action.context[key];
                                        }
                                    });
                                    return parent.action_manager.do_action(
                                        action, {disable_custom_filters: true}
                                    );
                                });
                            });
                        });
                    }
                }
            });
            instance.web.bus.trigger('resize');
        },
    })

    instance.mail.Thread.include({
        message_fetch_set_read: function(message_list)
        {
            this._super.apply(this, arguments);
            return this.message_fetch_set_read_navbar_needaction(message_list);
        },
        message_fetch_set_read_navbar_needaction: function()
        {
            // don't return the deferred object, this should be asynchronous
            this.render_mutex.exec(function()
            {
                instance.client.menu.load_navbar_needaction();
            });
        },
    })
}
