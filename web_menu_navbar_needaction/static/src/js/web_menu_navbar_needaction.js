//-*- coding: utf-8 -*-
// Copyright 2015-2018 Therp BV <https://therp.nl>
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
odoo.define('web_menu_navbar_needaction', function(require) {
    var bus = require('web.core').bus,
        chat_manager = require('mail.chat_manager'),
        CompoundContext = require('web.data').CompoundContext,
        pyeval = require('web.pyeval'),
        Menu = require('web.Menu'),
        Model = require('web.Model'),
        qweb = require('web.core').qweb;

    Menu.include({
        init: function() {
            var self = this,
                result = this._super.apply(this, arguments);
            this.on('menu_bound', this, function() {
                new Model('ir.config_parameter')
                    .call('get_param',
                          ['web_menu_navbar_needaction.refresh_timeout'])
                    .then(self.proxy('set_interval_navbar_needaction'));
            });
            return result;
        },
        start: function() {
            chat_manager.bus.on(
                'update_needaction', this, this.load_navbar_needaction
            );
            return this._super.apply(this, arguments);
        },
        set_interval_navbar_needaction: function(timeout) {
            if(parseInt(timeout, 10)) {
                this.navbar_needaction_timer = setInterval(
                    this.proxy('load_navbar_needaction'), timeout
                );
            }
            return this.load_navbar_needaction();
        },
        clear_interval_navbar_needaction: function(error, ev) {
            clearInterval(this.navbar_needaction_timer);
            ev.preventDefault();
        },
        load_navbar_needaction: function() {
            this.navbar_menu_ids = this.$el.parents('body')
                .find('#oe_main_menu_navbar a[data-menu]')
                .filter(function() {
                    return parseInt(jQuery(this).attr('data-menu'), 10);
                })
                .map(function() {
                    return parseInt(jQuery(this).attr('data-menu'), 10);
                })
                .get();
            return new Model('ir.ui.menu')
                .call('get_navbar_needaction_data', [this.navbar_menu_ids],
                      {}, {shadow: true})
                .then(this.proxy('process_navbar_needaction'))
                .fail(this.proxy('clear_interval_navbar_needaction'));
        },
        process_navbar_needaction: function(data) {
            var self = this;
            _.each(data, function (needaction_data, menu_id) {
                var $item = self.$el.parents('body').find(
                    _.str.sprintf('#oe_main_menu_navbar a[data-menu="%s"]',
                                  menu_id));
                if(!$item.length || _.isEmpty(needaction_data)) {
                    return;
                }
                $item.find('.badge').remove();
                if(needaction_data.count) {
                    var $counter = jQuery(qweb.render(
                            "Menu.needaction_counter", {
                                widget: {
                                    needaction_counter: needaction_data.count,
                                }
                            }
                        )).appendTo($item);
                    if(needaction_data.action_id) {
                        $counter.click(
                            needaction_data,
                            self.proxy('navbar_needaction_click')
                        );
                    }
                }
            });
            bus.trigger('resize');
        },
        navbar_needaction_click: function(ev) {
            var needaction_data = ev.data,
                parent = this.getParent();
            ev.stopPropagation();
            ev.preventDefault();
            return parent.menu_dm.add(
                this.rpc('/web/action/load', {
                action_id: needaction_data.action_id,
            }))
            .then(function(action) {
                return parent.action_mutex.exec(function() {
                    action.domain = needaction_data.action_domain;
                    action.context = new CompoundContext(
                        action.context || {}
                    );
                    action.context = pyeval.eval(
                        'context', action.context
                    );
                    _.each(_.keys(action.context), function(key) {
                        if(key.startsWith('search_default')) {
                            delete action.context[key];
                        }
                    });
                    return parent.action_manager.do_action(
                        action, {disable_custom_filters: true}
                    );
                });
            });
        },
    });
});
