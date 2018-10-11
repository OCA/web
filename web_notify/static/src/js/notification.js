/* Copyright 2018 Camptocamp
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define('web_notify.notification', function (require) {
    "use strict";

    var base_notification = require('web.notification'),
        WebClient = require('web.WebClient'),
        Notification = base_notification.Notification;

    var InteractiveNotification = Notification.extend({
        template: 'InteractiveNotification',
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
        init: function(parent, title, text, options) {
            this.options = options || {};
            var sticky = this.options.sticky;
            this._super.apply(this, [parent, title, text, sticky]);
        },
        reload_active_view: function() {
            this.trigger_up('reload_active_view');
        },
        button_do_action: function() {
            this.getParent().do_action(this.options.action);
        }
    });

    var InteractiveWarning = InteractiveNotification.extend({
        template: 'InteractiveWarning',
    });

    base_notification.NotificationManager.include({
        interactive_notify: function (title, text, options) {
            return this.display(new InteractiveNotification(this, title, text, options));
        },
        interactive_warn: function (title, text, options) {
            return this.display(new InteractiveWarning(this, title, text, options));
        }

    });

    return {
        InteractiveNotification: InteractiveNotification,
        InteractiveWarning: InteractiveWarning
    };

});
