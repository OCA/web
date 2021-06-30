/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.BroadcastMixin", function() {
    "use strict";

    return {
        init_broadcast: function(channel_in_name, channel_out_name) {
            if (!channel_in_name || !channel_out_name) {
                return new Error("Need define channel names!");
            }
            this._channel_in = new BroadcastChannel(channel_in_name);
            this._channel_out = new BroadcastChannel(channel_out_name);
            this._channel_in.addEventListener(
                "message",
                this._onReceiveBroadcastMessage.bind(this)
            );
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
