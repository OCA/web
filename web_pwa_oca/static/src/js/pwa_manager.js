/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

 odoo.define("web_pwa_oca.PWAManager", function(require) {
    "use strict";

    var Class = require("web.Class");
    var mixins = require("web.mixins");


    var PWAManager = Class.extend(mixins.ParentedMixin, {
        init: function() {
            if (!('serviceWorker' in navigator)) {
                throw new Error(
                    "This browser is not compatible with service workers");
            }
            this._service_worker = navigator.serviceWorker;
        },

        /**
         * @param {String} sw_script
         * @param {Function} success_callback
         * @returns {Promise}
         */
        registerServiceWorker: function(sw_script, success_callback) {
            return this._service_worker.register(sw_script)
                .then(success_callback)
                .catch(function(error) {
                    console.log('[ServiceWorker] Registration failed: ', error);
                });
        },
    });

    return PWAManager;
});
