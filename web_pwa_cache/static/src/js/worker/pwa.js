/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA", function(require) {
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

            this._load_promise = false;
            this._components = {};

            this._cache_hashes = params.cache_hashes;
            this._prefetched_urls = params.prefetched_urls;

            this._rpc = new OdooRPC();
            this._dbmanager = new DatabaseManager(this);
            this._cachemanager = new CacheManager(this);

            this._doLoad();
        },

        _doLoad: function() {
            this._load_promise = new Promise(async (resolve, reject) => {
                this._isLoaded = false;
                try {
                    await this._dbmanager.install();
                    await this._dbmanager.start();
                    this.config = new Config(this);
                    await this._initComponents();
                    this._isLoaded = true;
                    // This.config.sendToClient();
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
        },

        _initComponents: function() {
            return Promise.all([
                this._addComponent("importer", ComponentImporter),
                this._addComponent("exporter", ComponentExporter),
                this._addComponent("sync", ComponentSync),
                this._addComponent("prefetch", ComponentPrefetch),
            ]);
        },

        _addComponent: function(name, Classref) {
            this._components[name] = new Classref(this);
            return this._components[name].start();
        },

        _updateModelInfos: function() {
            const tasks = [];
            for (const component_name in this._components) {
                tasks.push(this._components[component_name].updateModelInfos());
            }
            return Promise.all(tasks);
        },

        /**
         * - Create cache storage
         * - Get cache resources
         * - Create sqlite tables
         * - Do first data import
         *
         * @override
         */
        installWorker: function() {
            const task = new Promise(async (resolve, reject) => {
                try {
                    await this._load_promise;
                    await this._cachemanager.addAll(
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
         * @override
         */
        activateWorker: function() {
            const task = new Promise(async (resolve, reject) => {
                try {
                    await this._load_promise;
                    await this._cachemanager.cleanOld([this._cache_hashes.pwa]);
                    this.config.sendToClient();
                } catch (err) {
                    return reject(err);
                }
                return resolve();
            });
            return Promise.all([this._super.apply(this, arguments), task]);
        },

        /**
         * @private
         * @param {URL} url
         */
        _getURLInfo: function(url) {
            const cached_urls = {
                "/web/webclient/qweb/": "qweb",
                "/web/webclient/load_menus/": "load_menus",
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

        isLoaded: function() {
            return this._isLoaded;
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
            if (!this.isLoaded()) {
                // PWA Not Actually Loaded
                console.warn(
                    "[ServiceWorker] The components are not currently loaded... Fallback to default browser behaviour."
                );
                return fetch(request);
            }

            // Service Worker only works in standlone mode
            console.log("------ MODE STANDL: ", this.config.isStandaloneMode());
            if (!this.config.isStandaloneMode()) {
                return fetch(request);
            }

            const isOffline = this.config.isOfflineMode();
            console.log("------ MODE OFF: ", isOffline);

            if (request.method === "GET") {
                return new Promise(async (resolve, reject) => {
                    try {
                        // Need redirect '/'?
                        const url = new URL(request.url);
                        if (url.pathname === "/" && isOffline) {
                            return resolve(tools.ResponseRedirect("/web"));
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
                        // Strategy: Cache First
                        const cache = await this._cachemanager.get(
                            this._cache_hashes.pwa
                        );
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
                        console.log("---- PAPAPA 111");
                        if (!this._prefetch_running) {
                            console.log("---- PAPAPA 222");
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
                    } catch (err) {
                        // Do nothing
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
