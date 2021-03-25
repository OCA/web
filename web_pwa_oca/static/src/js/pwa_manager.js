/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_oca.PWAManager", function(require) {
    "use strict";

    var core = require("web.core");
    var Widget = require("web.Widget");

    var _t = core._t;

    var PWAManager = Widget.extend({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            if (!("serviceWorker" in navigator)) {
                console.error(
                    _t(
                        "Service workers are not supported! Maybe you are not using HTTPS or you work in private mode."
                    )
                );
            } else {
                this._service_worker = navigator.serviceWorker;
                this.registerServiceWorker("/service-worker.js");
            }
        },

        /**
         * @param {String} sw_script
         * @returns {Promise}
         */
        registerServiceWorker: function(sw_script) {
            return this._service_worker
                .register(sw_script)
                .then(this._onRegisterServiceWorker)
                .catch(function(error) {
                    console.log(_t("[ServiceWorker] Registration failed: "), error);
                });
        },

        /**
         * Need register some extra API? override this!
         *
         * @private
         * @param {ServiceWorkerRegistration} registration
         */
        _onRegisterServiceWorker: function(registration) {
            console.log(_t("[ServiceWorker] Registered:"), registration);
        },
    });

    return PWAManager;
});
