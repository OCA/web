/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

 odoo.define("web_pwa_oca.webclient", function(require) {
    "use strict";

    var WebClient = require("web.WebClient");
    var PWAManager = require("web_pwa_oca.PWAManager");

    WebClient.include({
        /**
         * @override
         */
        show_application: function() {
            this.pwa_manager = new PWAManager();
            this.pwa_manager.setParent(this);
            this.pwa_manager.registerServiceWorker('/service-worker.js', this._onRegisterServiceWorker);
            return this._super.apply(this, arguments);
        },

        /**
         * Need register some extra API? override this!
         *
         * @param {ServiceWorkerRegistration} registration
         */
        _onRegisterServiceWorker: function(registration) {
            console.log('[ServiceWorker] Registered:', registration);
        },
    });
});
