/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

/**
 * Services workers are a piece of software separated from the user page.
 * Here can't use 'Odoo Bootstrap', so we can't work with 'require' system.
 * When the service worker is called to be installed from the "pwa_manager"
 * this class is instantiated.
 */

odoo.define("web_pwa_oca.PWA", function (require) {
    "use strict";

    const OdooClass = require("web.Class");

    const PWA = OdooClass.extend({
        // eslint-disable-next-line
        init: function (params) {
            // To be overridden
            this._sw_version = params.sw_version;
        },

        /**
         * @returns {Promise}
         */
        start: function () {
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        installWorker: function () {
            // To be overridden
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        /* eslint-disable no-unused-vars */
        activateWorker: function (forced) {
            // To be overridden
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        processRequest: function (request) {
            // To be overridden
            return fetch(request);
        },
    });

    return PWA;
});
