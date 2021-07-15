/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.systems.Cache", function(require) {
    "use strict";

    const OdooClass = require("web.Class");

    const CacheSystem = OdooClass.extend({
        /**
         * @param {String} cache_name
         * @returns {CacheStorage}
         */
        get: function(cache_name) {
            return caches.open(cache_name);
        },

        /**
         *
         * @param {String} cache_name
         * @param {Array} prefetched_urls
         * @returns {Promise}
         */
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
         * @param {Array} exceptions
         * @returns {Promise}
         */
        cleanOld: function(exceptions) {
            return caches.keys().then(keyList => {
                _.each(keyList, key => {
                    if (exceptions.indexOf(key) === -1) {
                        console.log("[ServiceWorker] Removing cache", key);
                        caches.delete(key);
                    }
                });
                return keyList;
            });
        },
    });

    return CacheSystem;
});
