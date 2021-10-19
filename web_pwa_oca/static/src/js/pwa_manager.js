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
            this._isServiceWorkerSupported = "serviceWorker" in navigator;
            if (!this._isServiceWorkerSupported) {
                console.error(
                    _t(
                        "Service workers are not supported! Maybe you are not using HTTPS or you work in private mode."
                    )
                );
            } else {
                this._service_worker = navigator.serviceWorker;
                this.registerServiceWorker("/service-worker.js", {
                    updateViaCache: "none",
                });
            }
        },

        /**
         * @param {String} sw_script
         * @returns {Promise}
         */
        registerServiceWorker: function(sw_script, options) {
            return this._service_worker
                .register(sw_script, options)
                .then(this._onRegisterServiceWorker.bind(this))
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
            console.log(_t("[ServiceWorker] Registered: "), registration);
        },
    });

    return PWAManager;
});
