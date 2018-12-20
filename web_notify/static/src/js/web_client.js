odoo.define('web_notify.WebClient', function (require) {
"use strict";

var core = require('web.core'),
    WebClient = require('web.WebClient'),
    base_bus = require('bus.bus'),
    Widget = require('web.Widget');


Widget.include({
    do_interactive_notify: function(title, message, options) {
        this.trigger_up(
            'interactive_notification',
            {title: title, message: message, options: options});
    },
    do_interactive_warn: function(title, message, options) {
        this.trigger_up(
            'interactive_warning',
            {title: title, message: message, options: options});
    },
});


WebClient.include({
    custom_events: _.extend(
        {},
        WebClient.prototype.custom_events,
        {reload_active_view: 'reload_active_view',
         interactive_notification: function (e) {
             if(this.notification_manager) {
                 this.notification_manager.interactive_notify(
                     e.data.title, e.data.message, e.data.options
                 );
             }
         },
         interactive_warning: function (e) {
             if(this.notification_manager) {
                 this.notification_manager.interactive_warn(
                     e.data.title, e.data.message, e.data.options
                 );
             }
         }
        }
    ),
    init: function(parent, client_options){
        this._super(parent, client_options);
        this.channel_warning = 'notify_warning_' + this.session.uid;
        this.channel_info = 'notify_info_' + this.session.uid;

    },
    reload_active_view: function(){
        var action_manager = this.action_manager;
        if(!action_manager){
            return;
        }
        var active_view = action_manager.inner_widget.active_view;
        if(active_view) {
            active_view.controller.reload();
        }
    },
    show_application: function() {
        var res = this._super();
        base_bus.bus.start_polling();
        base_bus.bus.add_channel(this.channel_warning);
        base_bus.bus.add_channel(this.channel_info);
        base_bus.bus.on('notification', this, this._web_notify_notification);
        return res
    },
    on_logout: function() {
        base_bus.bus.off('notification', this, this._web_notify_notification);
        this._super();
    },
    _web_notify_notification: function (notifications) {
        var self = this;
        _.each(notifications, function (notification) { 
            var channel = notification[0];
            var message = notification[1];
            if (channel === self.channel_warning) {
                self.on_message_warning(message);
            } else if (channel == self.channel_info) {
                self.on_message_info(message);
            }
        });
    },
    on_message_warning: function(message){
        if(this.notification_manager) {
            this.notification_manager.do_interactive_warn(
                message.title, message.message, message
            );
        }
    },
    on_message_info: function(message){
        if(this.notification_manager) {
            this.notification_manager.do_interactive_notify(
                message.title, message.message, message
            );
        }
    }
});

});
