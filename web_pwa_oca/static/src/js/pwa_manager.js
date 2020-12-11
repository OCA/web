/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_oca.PWAManager", function (require) {
    "use strict";

    var Widget = require("web.Widget");


    var PWAManager = Widget.extend({
        _deferredInstallPrompt: null,

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            if (!('serviceWorker' in navigator)) {
                throw new Error(
                    "This browser is not compatible with service workers");
            }
            this._service_worker = navigator.serviceWorker;
            this.registerServiceWorker('/service-worker.js');
            window.addEventListener(
                'beforeinstallprompt', this._onBeforeInstallPrompt.bind(this));
        },

        /**
         * @param {String} sw_script
         * @returns {Promise}
         */
        registerServiceWorker: function (sw_script) {
            return this._service_worker.register(sw_script)
                .then(this._onRegisterServiceWorker)
                .catch(function (error) {
                    console.log('[ServiceWorker] Registration failed: ', error);
                });
        },

        install: function () {
            if (!this._deferredInstallPrompt) {
                return;
            }
            var self = this;
            var systray_menu = this.getParent().menu.systray_menu;
            this._deferredInstallPrompt.prompt();
            // Log user response to prompt.
            this._deferredInstallPrompt.userChoice
                .then(function (choice) {
                    if (choice.outcome === 'accepted') {
                        // Hide the install button, it can't be called twice.
                        systray_menu.$el.find('#pwa_install_button')
                            .attr('hidden', true);
                        self._deferredInstallPrompt = null;
                        console.log('User accepted the A2HS prompt', choice);
                    } else {
                        console.log('User dismissed the A2HS prompt', choice);
                    }
                });
        },

        canBeInstalled: function () {
            return !_.isNull(this._deferredInstallPrompt);
        },

        /**
         * Handle PWA installation flow
         *
         * @private
         * @param {BeforeInstallPromptEvent} evt
         */
        _onBeforeInstallPrompt: function (evt) {
            evt.preventDefault();
            this._deferredInstallPrompt = evt;
            // UserMenu can be loaded after this module
            var menu = this.getParent().menu;
            if (menu && menu.systray_menu) {
                menu.systray_menu.$el.find('#pwa_install_button')[0]
                    .removeAttribute('hidden');
            }
        },

        /**
         * Need register some extra API? override this!
         *
         * @private
         * @param {ServiceWorkerRegistration} registration
         */
        _onRegisterServiceWorker: function (registration) {
            console.log('[ServiceWorker] Registered:', registration);
        },
    });

    return PWAManager;
});
