/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.CacheManager", function (require) {
    "use strict";

    const OdooClass = require("web.Class");
    const ParentedMixin = require('web.mixins').ParentedMixin;

    const CacheManager = OdooClass.extend(ParentedMixin, {
        init: function (parent) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
            this._cache = caches;
            this._caches = {};
        },

        /**
         * @param {String} cache_name
         * @returns {Promise[CacheStorage]}
         */
        start: function (cache_name) {
            if (_.has(this._caches, cache_name)) {
                return Promise.resolve(this._caches[cache_name]);
            }
            return new Promise(async resolve => {
                this._caches[cache_name] = await this._cache.open(cache_name);
                resolve(this._caches[cache_name]);
            });
        },

        /**
         * @param {String} cache_name
         * @returns {CacheStorage}
         */
        get: function (cache_name) {
            return this._caches[cache_name];
        },

        /**
         * @returns {Promise}
         */
        cleanAll: function () {
            return this._cache.keys().then(keyList => {
                keyList.map(key => {
                    console.log('[ServiceWorker] Removing cache', key);
                    if (key in this._caches) {
                        delete this._caches[key];
                    }
                    this._cache.delete(key);
                });
            });
        },

    });

    return CacheManager;

});
