/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA", function(require) {
    "use strict";

    const PWA = require("web_pwa_oca.PWA");
    const DatabaseSystem = require("web_pwa_cache.PWA.systems.Database");
    const CacheSystem = require("web_pwa_cache.PWA.systems.Cache");
    const SWSyncManager = require("web_pwa_cache.PWA.managers.Sync");
    const SWConfigManager = require("web_pwa_cache.PWA.managers.Config");
    const SWExporterComponent = require("web_pwa_cache.PWA.components.Exporter");
    const SWImporterComponent = require("web_pwa_cache.PWA.components.Importer");
    const SWPrefetchComponent = require("web_pwa_cache.PWA.components.Prefetch");
    const Tools = require("web_pwa_cache.PWA.core.base.Tools");

    PWA.include({
        _special_operations: [
            "create",
            "unlink",
            "write",
            "copy",
            "create_or_replace",
            "--call_button",
        ],

        /**
         * @override
         */
        init: function(params) {
            this._super.apply(this, arguments);

            this._wasActivated = false;

            this._components = {};
            this._managers = {};

            this._cache_hashes = params.cache_hashes;
            this._prefetched_urls = params.prefetched_urls;

            this._db = new DatabaseSystem();
            this._cache = new CacheSystem();
        },

        /**
         * @override
         */
        start: function () {
            const task = new Promise(async (resolve, reject) => {
                try {
                    await this._db.install();
                    await this._db.start();
                    await this._initManagers();
                    await this._initComponents();
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });

            return Promise.all([this._super.apply(this, arguments), task]);
        },

        /**
         * @returns {Promise}
         */
        _initManagers: function() {
            return Promise.all([
                this._addManager("config", SWConfigManager),
                this._addManager("sync", SWSyncManager),
            ]);
        },

        /**
         * @param {String} name
         * @param {Class} Classref
         * @returns {Promise}
         */
        _addManager: function(name, Classref) {
            this._managers[name] = new Classref(this);
            return this._managers[name].start();
        },

        /**
         * @returns {Promise}
         */
        _initComponents: function() {
            return Promise.all([
                this._addComponent("importer", SWImporterComponent),
                this._addComponent("exporter", SWExporterComponent),
                this._addComponent("prefetch", SWPrefetchComponent),
            ]);
        },

        /**
         * @param {String} name
         * @param {Class} Classref
         * @returns {Promise}
         */
        _addComponent: function(name, Classref) {
            this._components[name] = new Classref(this);
            return this._components[name].start();
        },

        /**
         * This is only call once per service worker.
         * At this point the service worker doesn't listen events (fetch, ...)
         * Can exists more than one service worker installed.
         *
         * @override
         */
        installWorker: function() {
            const task = new Promise(async (resolve, reject) => {
                try {
                    await this._cache.addAll(
                        this._cache_hashes.pwa,
                        this._prefetched_urls
                    );
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
            return Promise.all([this._super.apply(this, arguments), task]);
        },

        /**
         * Previous step before start listen "service worker" events (fetch, ...)
         * This can be called more times because the browser can stop the service worker.
         * If not altered using "skipWaiting or claim" only exists one service worker activated.
         * So, don't use these methods with this pwa implementation. You can use browser dev tools instead ;)
         * NOTE: sqlite.js can't be initialized in "activation" step
         *
         * @override
         */
        activateWorker: function() {
            const task = new Promise(async (resolve, reject) => {
                try {
                    // This flag indicates that the service worker was activated in some point on the life cycle
                    // can't be use to know if the service worker is stoped
                    this._wasActivated = true;
                    await this._cache.cleanOld([this._cache_hashes.pwa]);
                    this._managers.config.sendToPages();
                    this._managers.sync.sendCountToPages();
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
            return Promise.all([this._super.apply(this, arguments), task]);
        },

        /**
         * Some URL's need a special handle.
         * In this case we overwrite cache hashes generated by odoo
         *
         * @private
         * @param {URL} url
         */
        _getURLInfo: function(url) {
            const cached_urls = {
                "/web/webclient/qweb/": "qweb",
                "/web/webclient/load_menus/": "load_menus",
                "/web/webclient/translations/": "translations",
            };

            const url_info = {};
            const keys = _.keys(cached_urls);
            for (const cached_url of keys) {
                if (url.pathname.startsWith(cached_url)) {
                    url_info.cache_hash = url.pathname
                        .replace(cached_url, "")
                        .split("/", 1)[0];
                    url_info.pwa_cache_hash = this._cache_hashes[
                        cached_urls[cached_url]
                    ];
                    break;
                }
            }

            return url_info;
        },

        /**
         * Indicates that the current instance is fully loaded (ready to listen events)
         *
         * @returns {Boolean}
         */
        isLoaded: function() {
            return this._wasActivated;
        },

        /**
         * Intercepts 'GET' and 'POST' request.
         * If doesn't run the PWA in standalone mode all request goes
         * through network and will be cached.
         * If run in standalone mode:
         *  - online:
         *      If is a CUD operation goes through network, if fails tries from cache.
         *      Other requests goes through cache directly, if fails tries network.
         *  - offline: Tries from cache
         * @override
         */
        processRequest: function(request) {
            const isStandaloneMode =
                (this._managers.config && this._managers.config.isStandaloneMode()) ||
                false;
            const isOffline =
                (this._managers.config && this._managers.config.isOfflineMode()) ||
                false;
            // console.log("------ STANDALONE: ", isStandaloneMode);
            // console.log("------ MODE OFF: ", isOffline);
            // console.log("------ METHOD: ", request.method);

            if (request.method === "GET") {
                return new Promise(async (resolve, reject) => {
                    try {
                        // Strategy: Network first in not standlone mode
                        if (!isStandaloneMode && request.cache !== "only-if-cached") {
                            const request_cloned_network = request.clone();
                            const response_net = await fetch(request_cloned_network);
                            if (response_net) {
                                return resolve(response_net);
                            }
                        }

                        // Need redirect '/'?
                        const url = new URL(request.url);
                        if ((url.pathname === "/" || (url.pathname ==="/web" && url.search)) && isOffline) {
                            return resolve(Tools.ResponseRedirect("/web"));
                        }
                        // Check cached url's to use generic cache hash
                        const url_info = this._getURLInfo(url);
                        if (isOffline && url_info.cache_hash) {
                            const new_url = request.url.replace(
                                url_info.cache_hash,
                                url_info.pwa_cache_hash
                            );
                            request = new Request(new_url);
                        }

                        // Try from cache
                        const cache = await this._cache.get(this._cache_hashes.pwa);
                        const response_cache = await cache.match(request);
                        if (response_cache) {
                            return resolve(response_cache);
                        }
                        if (!this._prefetch_running) {
                            // Try from "dynamic" cache
                            try {
                                const request_cloned_cache = request.clone();
                                const response_cache = await this._tryGetFromCache(
                                    request_cloned_cache
                                );
                                return resolve(response_cache);
                            } catch (err) {
                                console.log(
                                    "[ServiceWorker] Can't process GET request '" +
                                        url.pathname +
                                        "'. Fallback to browser behaviour..."
                                );
                                console.log(err);
                            }
                        }
                        // Fallback
                        if (!isOffline && request.cache !== "only-if-cached") {
                            return resolve(fetch(request));
                        }
                        return reject();
                    } catch (err) {
                        return reject(err);
                    }
                });
            } else if (
                isStandaloneMode &&
                request.method === "POST" &&
                request.headers.get("Content-Type") === "application/json"
            ) {
                return new Promise(async (resolve, reject) => {
                    try {
                        const request_cloned_cache = request.clone();
                        // Try CUD operations
                        // Methodology: Network first
                        if (!isOffline) {
                            const request_oper = this._getRequestOperation(request);
                            if (this._special_operations.indexOf(request_oper) !== -1) {
                                try {
                                    const response_net = await this._tryFromNetwork(
                                        request
                                    );
                                    if (response_net) {
                                        return resolve(response_net);
                                    }
                                } catch (err) {
                                    // Do nothing
                                }
                            }
                        }

                        // Don try from cache if a prefetch tasks is running
                        if (!this._prefetch_running) {
                            // Other request (or network fails) go directly from cache
                            try {
                                const response_cache = await this._tryPostFromCache(
                                    request_cloned_cache
                                );
                                return resolve(response_cache);
                            } catch (err) {
                                const request_url = new URL(request.url);
                                console.log(
                                    `[ServiceWorker] The POST request can't be processed: '${request_url.pathname}' content cached not found! Fallback to default browser behaviour...`
                                );
                                console.log(err);
                                this._onCacheNotFound(request, err);
                            }
                        }

                        // If all fails fallback to network (excepts in offline mode)
                        if (isOffline) {
                            // Avoid default browser behaviour
                            return reject();
                        }

                        const response_net = await this._tryFromNetwork(request);
                        return resolve(response_net);
                    } catch (err) {
                        // Do nothing
                    }

                    try {
                        const response_net = await fetch(request);
                        return resolve(response_net);
                    } catch (err) {
                        this._managers.config.set("pwa_mode", "offline");
                        this.postBroadcastMessage({
                            type: "PWA_CONFIG_CHANGED",
                            changes: {pwa_mode: "offline"},
                        });
                        return resolve(new Response("", {headers: {"Refresh": "0"}}));
                    }
                });
            }
            return fetch(request);
        },

        /**
         * @param {Request} request
         * @param {Exception} err
         */
        _onCacheNotFound: function() {
            // To be overrided
        },

        /**
         * Try obtain the operation of the request.
         *
         * @private
         * @param {FetchRequest} request_cloned
         * @returns {String}
         */
        _getRequestOperation: function(request_cloned) {
            const url = new URL(request_cloned.url);
            if (
                url.pathname.startsWith("/web/dataset/call_kw/") ||
                url.pathname.startsWith("/web/dataset/call/")
            ) {
                const pathname_parts = url.pathname.split("/");
                const method_name = pathname_parts[5];
                return method_name;
            } else if (url.pathname.startsWith("/web/dataset/call_button")) {
                return "--call_button";
            }
            return "";
        },

        /**
         * @private
         * @param {Promise} request
         * @returns {Promise}
         */
        _tryFromNetwork: function(request) {
            return new Promise(async (resolve, reject) => {
                const request_cloned_net = request.clone();
                try {
                    const response_net = await fetch(request_cloned_net);
                    if (response_net) {
                        const request_oper = this._getRequestOperation(
                            request_cloned_net
                        );
                        // Handle special operations
                        if (this._special_operations.indexOf(request_oper) >= 0) {
                            const request_data = await request_cloned_net.json();
                            this._processResponse(response_net, request_data);
                        }
                        // Else {
                        //     await this._components.prefetch.prefetchModelData();
                        // }
                        return resolve(response_net);
                    }
                } catch (err) {
                    return reject(err);
                }
                return reject();
            });
        },

        /**
         * @private
         * @returns {Promise}
         */
        _tryPostFromCache: function(request_cloned_cache) {
            return new Promise(async (resolve, reject) => {
                try {
                    const request_data = await request_cloned_cache.json();
                    const url = new URL(request_cloned_cache.url);
                    const route_entries = Object.entries(this._routes.post.out);
                    for (const [key, fnct] of route_entries) {
                        if (url.pathname.startsWith(key)) {
                            const result = await this[fnct](url, request_data);
                            return resolve(result);
                        }
                    }
                    // Generic Post Cache
                    return resolve(await this._routeOutGenericPost(url, request_data));
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @private
         * @returns {Promise}
         */
        _tryGetFromCache: function(request_cloned_cache) {
            return new Promise(async (resolve, reject) => {
                const url = new URL(request_cloned_cache.url);
                const route_entries = Object.entries(this._routes.get);
                for (const [key, fnct] of route_entries) {
                    if (url.pathname.startsWith(key)) {
                        try {
                            const result = await this[fnct](url);
                            return resolve(result);
                        } catch (err) {
                            return reject(err);
                        }
                    }
                }
                return reject();
            });
        },

        /**
         * Process request response to cache the values
         *
         * @private
         * @param {FetchResponse} response
         * @param {Object} request_data
         * @returns {Promise}
         */
        _processResponse: function(response, request_data) {
            console.log("[ServiceWorker] Processing Response...");
            if (!response) {
                return false;
            }
            const response_cloned = response.clone();
            return new Promise(async (resolve, reject) => {
                try {
                    const response_data = await response_cloned.json();
                    const url = new URL(response_cloned.url);
                    const route_entries = Object.entries(this._routes.post.in);
                    for (const [key, fnct] of route_entries) {
                        if (url.pathname.startsWith(key)) {
                            await this[fnct](url, response_data, request_data);
                            break;
                        }
                    }
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
        },
    });
});
