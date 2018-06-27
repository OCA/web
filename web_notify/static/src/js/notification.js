odoo.define('web_notify.notification', function (require) {
    "use strict";

    var base_notification = require('web.notification'),
        WebClient = require('web.WebClient'),
        Notification = base_notification.Notification,
        Warning = base_notification.Warning;

    Notification.include({
        events: _.extend(
            {},
            Notification.prototype.events,
            {'click .o_notification_reload_view': function(e){
                e.preventDefault();
                this.reload_active_view();
            },
             'click .o_notification_do_action': function(e){
                 e.preventDefault();
                 this.button_do_action();
             }
            }
        ),
        init: function(parent, title, text, sticky, options) {
            this._super.apply(this, arguments);
            this.options = options || {};
        },
        reload_active_view: function() {
            this.trigger_up('reload_active_view');
        },
        button_do_action: function() {
            console.log(this.options.action);
            this.getParent().do_action(this.options.action);
        }
    });

    base_notification.NotificationManager.include({
        notify: function(title, text, sticky, options) {
            return this.display(new Notification(this, title, text, sticky, options));
        },
        warn: function(title, text, sticky, options) {
            return this.display(new Warning(this, title, text, sticky, options));
        },

    });

});
