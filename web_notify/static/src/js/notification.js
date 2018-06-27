/* Copyright 2018 Camptocamp
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
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
            {'click .o_view_reload': function(e){
                e.preventDefault();
                this.reload_active_view();
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
