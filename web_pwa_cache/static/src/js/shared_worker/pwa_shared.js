/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWAShared", function(require) {
    "use strict";

    const OdooClass = require("web.Class");

    const PWAShared = OdooClass.extend({
        // eslint-disable-next-line
        init: function(params) {
            // To be overridden
        },

        /**
         * @returns {Promise}
         */
        start: function() {
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        onMessageReceived: function() {
            // To be overridden
            return Promise.resolve();
        },
    });

    return PWAShared;
});
