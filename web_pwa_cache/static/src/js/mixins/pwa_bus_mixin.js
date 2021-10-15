/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.BusMixin", function(require) {
    "use strict";

    const Utils = require("web_pwa_cache.Utils");

    return {
        /**
         * @private
         * @param {String} route
         * @param {Object} values
         * @returns {Promise}
         */
        _sendInternalPWAPost: function(route, values) {
            return Utils.sendJSON(`/pwa/sw/${route}`, values || {});
        },

        /**
         * @param {String} type
         * @param {Object} data
         * @returns {Promise}
         */
        sendPWABusMessage: function(type, data) {
            return this._sendInternalPWAPost("bus", _.extend({}, data, {type: type}));
        },
    };
});
