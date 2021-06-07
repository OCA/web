/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.BroadcastMixin", function() {
    "use strict";

    return {
        // Channel to receive
        _broadcast_channel_in_name: false,
        // Channel to send
        _broadcast_channel_out_name: false,

        start: function() {
            if (!this._broadcast_channel_in_name || !this._broadcast_channel_out_name) {
                return Promise.reject("Need define channel names!");
            }
            this._channel_in = new BroadcastChannel(this._broadcast_channel_in_name);
            this._channel_out = new BroadcastChannel(this._broadcast_channel_out_name);
            this._channel_in.addEventListener(
                "message",
                this._onReceiveBroadcastMessage.bind(this)
            );
            return this._super.apply(this, arguments);
        },

        postBroadcastMessage: function(message) {
            this._channel_out.postMessage(message);
        },

        _onReceiveBroadcastMessage: function(evt) {
            if (!evt.isTrusted) {
                return false;
            }
            return true;
        },
    };
});
