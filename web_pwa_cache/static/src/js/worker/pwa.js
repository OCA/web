/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA", function (require) {
    "use strict";

    const PWA = require("web_pwa_oca.PWA");
    const OdooRPC = require("web_pwa_cache.PWA.core.base.RPC");
    const DatabaseManager = require("web_pwa_cache.PWA.core.DatabaseManager");
    const CacheManager = require("web_pwa_cache.PWA.core.CacheManager");
    const Config = require("web_pwa_cache.PWA.core.Config");
    const tools = require("web_pwa_cache.PWA.core.base.Tools");
    const ComponentExporter = require("web_pwa_cache.PWA.components.Exporter");
    const ComponentImporter = require("web_pwa_cache.PWA.components.Importer");
    const ComponentPrefetch = require("web_pwa_cache.PWA.components.Prefetch");
    const ComponentSync = require("web_pwa_cache.PWA.components.Sync");


    PWA.include({
        _special_operations: ["create", "unlink", "write", "copy", "create_or_replace", "--call_button"],

        /**
         * @override
         */
        init: function (params) {
            this._isLoaded = false;
            this._super.apply(this, arguments);

            this._components = {};

            this._cache_name = params.cache_name;
            this._prefetched_urls = params.prefetched_urls;

            this._rpc = new OdooRPC();
            this._dbmanager = new DatabaseManager(this);
            this._cachemanager = new CacheManager(this);

            this._whenLoaded();
        },

        _whenLoaded: function () {
            if (!this._loadPromise) {
                this._isLoaded = false;
                this._loadPromise = new Promise(async resolve => {
                    await this._cachemanager.cleanAll();
                    await this._cachemanager.start(this._cache_name);
                    await this._dbmanager.start();
                    this.config = new Config(this);
                    await this._initComponents();
                    this.config.sendToClient();
                    this._isLoaded = true;
                    return resolve(true);
                });
            }

            return this._loadPromise;
        },

        _initComponents: function () {
            return Promise.all([
                this._addComponent("importer", ComponentImporter),
                this._addComponent("exporter", ComponentExporter),
                this._addComponent("sync", ComponentSync),
                this._addComponent("prefetch", ComponentPrefetch)
            ]);

        },

        _addComponent: function (name, Classref) {
            this._components[name] = new Classref(this);
            return this._components[name].start();
        },

        /**
         * @override
         */
        installWorker: function () {
            return Promise.all([this._super.apply(this, arguments), this._whenLoaded()])
                .then(() => {
                    this._components.prefetch.prefetchDataGet(this._cache_name, this._prefetched_urls)
                });
        },

        /**
         * @override
         */
        activateWorker: function () {
            return Promise.all([this._super.apply(this, arguments), this._whenLoaded()]);
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
        processRequest: function (request) {
            if (_.isEmpty(this._components)) {
                // PWA Not Actually Loaded
                console.warn("[ServiceWorker] The components are not currently loaded... Fallback to default browser behaviour.");
                return fetch(request);
            }
            if (request.method === 'GET') {
                return new Promise(async (resolve, reject) => {
                    try {
                        const isOffline = this.config.isOfflineMode();
                        const isStandalone = this.config.isStandaloneMode();
                        // need redirect '/'?
                        const url = new URL(request.url);
                        if (url.pathname === '/' && (isOffline || isStandalone)) {
                            return resolve(tools.ResponseRedirect('/web'));
                        }
                        // Strategy: Cache First
                        const response_cache = await this._cachemanager.get(this._cache_name).match(request);
                        if (response_cache) {
                            return resolve(response_cache);
                        }
                        if (isStandalone && !this._prefetch_run) {
                            // Try from "dynamic" cache
                            try {
                                const request_cloned_cache = request.clone();
                                const response_cache = await this._tryGetFromCache(
                                    request_cloned_cache
                                );
                                return resolve(response_cache);
                            } catch (err) {
                                console.log("[ServiceWorker] Can't process GET request '"+ url.pathname +"'. Fallback to browser behaviour...");
                                console.log(err);
                            }
                        }
                        // Fallback
                        if (!isOffline && request.cache !== 'only-if-cached') {
                            return resolve(fetch(request));
                        }
                        return reject();
                    } catch (err) {
                        return reject(err);
                    }
                });
            } else if (
                request.method === "POST" &&
                request.headers.get("Content-Type") === "application/json"
            ) {
                return new Promise(async (resolve, reject) => {
                    try {
                        const isStandalone = this.config.isStandaloneMode();
                        if (isStandalone) {
                            const isOffline = this.config.isOfflineMode();
                            const request_cloned_cache = request.clone();
                            // Try CUD operations
                            // Methodology: Network first
                            if (!isOffline) {
                                const request_oper = this._getRequestOperation(request);
                                if (this._special_operations.indexOf(request_oper) !== -1) {
                                    const response_net = await this._tryFromNetwork(
                                        request
                                    );
                                    if (response_net) {
                                        return resolve(response_net);
                                    }
                                }
                            }

                            // Don try from cache if a prefetch tasks is running
                            if (!this._prefetch_run) {
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
                                    if (isOffline) {
                                        const request_url = new URL(request.url);
                                        this.postClientPageMessage({
                                            type: "PWA_CACHE_FAIL",
                                            error: err,
                                            url: request_url.pathname,
                                        });
                                    }
                                }
                            }

                            // If all fails fallback to network (excepts in offline mode)
                            if (isOffline) {
                                // Avoid default browser behaviour
                                return reject();
                            }

                            const response_net = await this._tryFromNetwork(request);
                            return resolve(response_net);
                        }
                    } catch (err) {
                        // do nothing
                    }

                    return resolve(fetch(request));
                });
            }
            return fetch(request);
        },

        /**
         * Try obtain the operation of the request.
         *
         * @private
         * @param {FetchRequest} request_cloned
         * @returns {String}
         */
        _getRequestOperation: function (request_cloned) {
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
         * @param {Promise} request_cloned
         */
        _tryFromNetwork: function (request) {
            return new Promise(async (resolve, reject) => {
                const request_cloned_net = request.clone();
                try {
                    const response_net = await fetch(request_cloned_net);
                    if (response_net) {
                        const request_oper = this._getRequestOperation(request_cloned_net);
                        // Handle special operations
                        if (this._special_operations.indexOf(request_oper) !== -1) {
                            await this._components.prefetch.prefetchModelData();
                        } else {
                            const request_data = await request_cloned_net.json();
                            this._processResponse(response_net, request_data);
                        }
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
         * @returns {Promise[Response]}
         */
        _tryPostFromCache: function (request_cloned_cache) {
            return new Promise(async (resolve, reject) => {
                try {
                    const request_data = await request_cloned_cache.json();
                    const url = new URL(request_cloned_cache.url);
                    const route_entries = Object.entries(this._routes.post.out);
                    for (let [key, fnct] of route_entries) {
                        if (url.pathname.startsWith(key)) {
                            const result = await this[fnct](url, request_data);
                            this._components.sync.updateClientCount();
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
         * @returns {Promise[Response]}
         */
        _tryGetFromCache: function (request_cloned_cache) {
            return new Promise(async (resolve, reject) => {
                const url = new URL(request_cloned_cache.url);
                const route_entries = Object.entries(this._routes.get);
                for (let [key, fnct] of route_entries) {
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
         * @return {Promise}
         */
        _processResponse: function (response, request_data) {
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
                    for (let [key, fnct] of route_entries) {
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
