/* Copyright 2018 Kmee Informática
* Gabriel Cardoso de Faria <gabriel.cardoso@kmee.com.br>
* Fisher Yu <szufisher@gmail.com>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define('web_auto_refresh', function (require) {
	"use strict";
	let WebClient = require('web.WebClient');
    let bus = require('bus.bus');
    let session = require('web.session');

    WebClient.include({
        init: function(parent, client_options){
            this._super(parent, client_options);
            this.known_bus_channels = [];
            this.known_bus_events = [];
        },
        show_application: function() {
            this._super();
            this.start_polling();
        },
        on_logout: function() {
            bus.off('notification', this, this.bus_notification);
            _(this.known_bus_channels).each(function (channel) {
                bus.bus.delete_channel(channel);
            });
            _(this.known_bus_events).each(function(e) {
                this.bus_off(e[0], e[1]);
            });
            this._super();
        },
        start_polling: function() {
            this.declare_bus_channel();
			
            bus.bus.on('notification', this, this.bus_notification);
            bus.bus.start_polling();
        },
        bus_notification: function(notification) {
            let channel = notification[0][0];
            if (this.known_bus_channels.indexOf(channel) !== -1) {
                let message = notification[0][1];
                bus.bus.trigger(channel, message);
            }
        },
        bus_on: function(eventname, eventfunction) {
            console.log(eventname, eventfunction);
            bus.bus.on(eventname, this, eventfunction);
            this.known_bus_events.push([eventname, eventfunction]);
        },
        bus_off: function(eventname, eventfunction) {
            bus.bus.off(eventname, this, eventfunction);
            let index = _.indexOf(this.known_bus_events, [eventname, eventfunction]);
            this.known_bus_events.splice(index, 1);
        },
        declare_bus_channel: function() {
            let channel = 'web_auto_refresh';
            this.bus_on(channel, function(message) {            // generic auto referesh
                let active_view = this.action_manager.inner_widget.active_view;
                if (typeof(active_view) !== 'undefined'){   // in mail inbox page, no active view defined
                    let controller = this.action_manager.inner_widget.active_view.controller;
                    let action = this.action_manager.inner_widget.action;
                    if ( action.auto_search && controller.model === message ){
                        if (active_view.type === "kanban")
                            controller.do_reload();    // kanban view has reload function, but only do_reload works as expected
                        if (active_view.type === "list" &&
                            ! controller.$buttons.hasClass('oe_editing') &&
                            ! controller.grouped)
                            controller.reload();     // list view only has reload
                    }
                }
            }); 
			this.add_bus_channel(channel);
        },
        add_bus_channel: function(channel) {
            if (this.known_bus_channels.indexOf(channel) === -1) {
                bus.bus.add_channel(channel);
                this.known_bus_channels.push(channel);
            }
        },
    })
});
