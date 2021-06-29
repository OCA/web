/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.bus", function(require) {
    "use strict";

    const BroadcastMixin = require("web_pwa_cache.BroadcastMixin");
    const PWA = require("web_pwa_oca.PWA");
    require("web_pwa_cache.PWA");

    /**
     * This class is used to communicate with the user page.
     */
    PWA.include(BroadcastMixin);
    PWA.include({
        /**
         * @override
         */
        init: function () {
            this.init_broadcast("pwa-sw-messages", "pwa-page-messages");
            this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        _onCacheNotFound: function(request, err) {
            this._super.apply(this, arguments);
            const isOffline =
                (this._managers.config && this._managers.config.isOfflineMode()) ||
                false;
            if (isOffline) {
                const request_url = new URL(request.url);
                this.postBroadcastMessage({
                    type: "PWA_CACHE_FAIL",
                    error: err,
                    url: request_url.pathname,
                });
            }
        },

        /**
         * @private
         * @param {BroadcastChannelEvent} evt
         */
        // eslint-disable-next-line
        _onReceiveBroadcastMessage: function(evt) {
            const res = this._super.apply(this, arguments);
            if (!res || !this.isLoaded()) {
                return;
            }
            switch (evt.data.type) {
                // Received to start the prefetching process
                case "START_PREFETCH":
                    this._doPrefetchDataPost();
                    break;
            }
        },

        /**
         * Initialize the prefetching process.
         * Try to sync. records first.
         *
         * @returns {Promise}
         */
        _doPrefetchDataPost: function() {
            if (this._prefetch_promise) {
                return this._prefetch_promise;
            }

            this._prefetch_promise = new Promise(async (resolve, reject) => {
                this._prefetch_running = true;
                try {
                    const is_offline_mode = this._managers.config.isOfflineMode();
                    if (is_offline_mode) {
                        return resolve();
                    }
                    // Try sync records first
                    await this._managers.sync.run();
                    // Try prefetch data
                    await this._components.prefetch.prefetchDataPost();
                    // If have transactions to sync. tell it to the user
                    const records = await this._managers.sync.getSyncRecords();
                    if (records.length) {
                        this.postBroadcastMessage({
                            type: "PWA_SYNC_NEED_ACTION",
                            count: records.length,
                        });
                    }
                } catch (err) {
                    console.log("[ServiceWorker] Prefetch Data Post failed...");
                    return reject(err);
                }

                return resolve();
            }).finally(() => {
                this._prefetch_promise = undefined;
                this._prefetch_running = false;
            });

            return this._prefetch_promise;
        },
    });
});
