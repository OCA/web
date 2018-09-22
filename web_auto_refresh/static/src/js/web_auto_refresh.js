/* Copyright 2013, 2018 Fisher Yu, Pichler Wolfgang
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_auto_refresh', function (require) {
    "use strict";
    var WebClient = require('web.WebClient');
    var bus = require('bus.bus');

    WebClient.include({
        init: function (parent, client_options) {
            this._super(parent, client_options);
            this.known_bus_channels = [];
            this.known_bus_events = [];
        },
        show_application: function () {
            var res = this._super();
            bus.bus.start_polling();
            bus.bus.add_channel('auto_refresh');
            bus.bus.on('notification', this, this.bus_refresh_notification);
            return res;
        },
        on_logout: function () {
            bus.bus.off('notification', this, this.bus_refresh_notification);
            this._super();
        },
        bus_refresh_notification: function (notifications) {
            var self = this;
            _.each(notifications, function (notification) {
                var channel = notification[0];
                var message = notification[1];
                if (channel === 'auto_refresh') {
                    self.on_auto_refresh_message(message);
                }
            });
        },

        on_auto_refresh_message: function(message) {
            var active_view = this.action_manager.inner_widget.active_view;
            if (typeof(active_view) != 'undefined') {   // in mail inbox page, no active view defined
                var controller = this.action_manager.inner_widget.active_view.controller;
                var action = this.action_manager.inner_widget.action;
                if (action.auto_search && controller.model == message && !controller.$buttons.hasClass('oe_editing')) {
                    if (active_view.type == "kanban")
                        controller.do_reload();    // kanban view has reload function, but only do_reload works as expected
                    if (active_view.type == "list")
                        controller.reload();     // list view only has reload
                }
            }
        }
    });
    return WebClient;
});
