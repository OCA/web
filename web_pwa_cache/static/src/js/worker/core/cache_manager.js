/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.CacheManager", function(require) {
    "use strict";

    const OdooClass = require("web.Class");
    const ParentedMixin = require("web.mixins").ParentedMixin;

    const CacheManager = OdooClass.extend(ParentedMixin, {
        init: function(parent) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
        },

        /**
         * @param {String} cache_name
         * @returns {CacheStorage}
         */
        get: function(cache_name) {
            return caches.open(cache_name);
        },

        addAll: function(cache_name, prefetched_urls) {
            return new Promise(async (resolve, reject) => {
                try {
                    const cache = await this.get(cache_name);
                    for (const pre_url of prefetched_urls) {
                        await cache.add(pre_url);
                    }
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        /**
         * @returns {Promise}
         */
        cleanOld: function(exceptions) {
            return caches.keys().then(keyList => {
                keyList.map(key => {
                    if (exceptions.indexOf(key) === -1) {
                        console.log("[ServiceWorker] Removing cache", key);
                        caches.delete(key);
                    }
                });
            });
        },
    });

    return CacheManager;
});
