/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_oca.PWA", function(require) {
    "use strict";

    const OdooClass = require("web.Class");

    const PWA = OdooClass.extend({
        init: function(params) {
            this._sw_version = params.sw_version;
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
        installWorker: function() {
            // To be overridden
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        activateWorker: function() {
            // To be overridden
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        processRequest: function() {
            // To be overridden
            return Promise.resolve();
        },
    });

    return PWA;
});
