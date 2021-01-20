/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.BroadcastSWMixin", function () {
    "use strict";

    return {
        _channel_in_name: 'sw-messages',
        _channel_out_name: 'cl-messages',

        init: function () {
            this._super.apply(this, arguments);
            this._channel_in = new BroadcastChannel(this._channel_in_name);
            this._channel_out = new BroadcastChannel(this._channel_out_name);
            this._channel_in.addEventListener('message', this._onReceiveServiceWorkerMessage.bind(this));
        },

        postServiceWorkerMessage: function (message) {
            this._channel_out.postMessage(message);
        },

        _onReceiveServiceWorkerMessage: function (evt) {
            if (!evt.isTrusted) {
                return;
            }
        },
    };
});
