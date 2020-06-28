/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
"use strict";

const CacheManager = OdooClass.extend({
    init: function() {
        this._cache = caches;
        this._caches = {};
    },

    /**
     * @returns {Promise[CacheStorage]}
     */
    initCache: function(cache_name) {
        if (_.has(this._caches, cache_name)) {
            return Promise.resolve(this._caches[cache_name]);
        }
        return new Promise(async resolve => {
            this._caches[cache_name] = await this._cache.open(cache_name);
            resolve(this._caches[cache_name]);
        });
    },

    /**
     * @returns {CacheStorage}
     */
    get: function(cache_name) {
        return this._caches[cache_name];
    },

    /**
     * @returns {Promise}
     */
    clean: function() {
        return this._cache.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (!_.has(this._caches, key)) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return this._cache.delete(key);
                }
            }));
        });
    },

});
