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
    const rpc = require("web_pwa_cache.PWA.core.base.rpc");

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

            this._components = {};
            this._managers = {};

            this._cache_hashes = params.cache_hashes;
            this._prefetched_urls = params.prefetched_urls;

            this._db = new DatabaseSystem();
            this._cache = new CacheSystem();

            this._wasActivated = false;
            this._isDisabled = true;
        },

        /**
         * @returns {Promise}
         */
        start: function() {
            const task = new Promise(async (resolve, reject) => {
                this._isDisabled = true;
                try {
                    const [response_s] = await rpc.callJSonRpc(
                        "res.users",
                        "has_group",
                        ["web_pwa_cache.group_pwa_cache"]
                    );
                    const response_s_data = (await response_s.json()).result;
                    this._isDisabled = !response_s_data;
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
            if (this._isDisabled) {
                return Promise.resolve();
            }
            return new Promise(async (resolve, reject) => {
                await this._super.apply(this, arguments);
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
        activateWorker: function(forced) {
            const task = new Promise(async (resolve, reject) => {
                try {
                    if (this._isDisabled) {
                        // Initialize minimal required managers to handle configuration changes
                        await this._db._onStartIndexedDB();
                        await this._addManager("config", SWConfigManager);
                        if (forced) {
                            this.postBroadcastMessage({
                                type: "PWA_SW_FORCED_INIT",
                            });
                        }
                        return resolve();
                    }

                    if (!this._wasActivated) {
                        await this._db.start();
                        await this._initManagers();
                        await this._initComponents();
                    }
                    await this._cache.cleanOld([this._cache_hashes.pwa]);
                    this._wasActivated = true;
                    if (forced) {
                        this.postBroadcastMessage({
                            type: "PWA_SW_FORCED_INIT",
                        });
                    }
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
         * @returns {Object}
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
            if (url.search.includes("debug=")) {
                url_info.has_debug = true;
            }

            return url_info;
        },

        /**
         * Indicates that the current instance is fully loaded (ready to listen events)
         *
         * @returns {Boolean}
         */
        isActivated: function(strict_mode = true) {
            return (
                (!strict_mode || (strict_mode && !this._isDisabled)) &&
                self.serviceWorker &&
                self.serviceWorker.state === "activated"
            );
        },

        processRequestGET: function(request, url, options) {
            if (request.method !== "GET") {
                return Promise.resolve(false);
            }
            return new Promise(async resolve => {
                try {
                    // Strategy: Network first in not standlone mode
                    if (
                        !options.is_standalone_mode &&
                        request.cache !== "only-if-cached"
                    ) {
                        const request_cloned_network = request.clone();
                        const response_net = await fetch(request_cloned_network);
                        if (response_net) {
                            return resolve(response_net);
                        }
                    }

                    // Need redirect '/'?
                    if (
                        (url.pathname === "/" ||
                            (url.pathname === "/web" && url.search)) &&
                        options.is_offline
                    ) {
                        return resolve(Tools.ResponseRedirect("/web"));
                    }
                    // Check cached url's to use generic cache hash
                    if (options.is_offline) {
                        const url_info = this._getURLInfo(url);
                        let is_url_modified = false;
                        if (url_info.has_debug) {
                            const search_part = url.search.replace(
                                /\??debug=[\d\w]+&?/,
                                ""
                            );
                            url.search = search_part;
                            is_url_modified = true;
                        }
                        if (url_info.cache_hash) {
                            url.pathname = url.pathname.replace(
                                url_info.cache_hash,
                                url_info.pwa_cache_hash
                            );
                            is_url_modified = true;
                        }
                        if (is_url_modified) {
                            request = new Request(url);
                        }
                    }

                    // Try from cache
                    const cache = await this._cache.get(this._cache_hashes.pwa);
                    const response_cache = await cache.match(request);
                    if (response_cache) {
                        return resolve(response_cache);
                    }
                    if (!this._prefetch_running) {
                        // Try from "dynamic" cache
                        const request_cloned_cache = request.clone();
                        const response_internal_cache = await this._tryGetFromCache(
                            request_cloned_cache
                        );
                        return resolve(response_internal_cache);
                    }
                } catch (err) {
                    console.log(
                        "[ServiceWorker] Can't process GET request '" +
                            url.pathname +
                            "'. Fallback to browser behaviour..."
                    );
                    console.log(err);
                }

                // Fallback
                if (request.cache !== "only-if-cached") {
                    try {
                        const fetch_res = await fetch(request);
                        return resolve(fetch_res);
                    } catch (err) {
                        // Do nothing
                    }
                }
                return resolve(false);
            });
        },

        processRequestPOST: function(request, url, options) {
            if (
                !options.is_standalone_mode ||
                request.method !== "POST" ||
                !request.headers
                    .get("Content-Type")
                    .toLowerCase()
                    .includes("application/json")
            ) {
                return Promise.resolve(false);
            }

            return new Promise(async resolve => {
                try {
                    // Try CUD operations
                    // Methodology: Network first
                    if (!options.is_offline) {
                        const request_oper = this._getRequestOperation(request);
                        if (this._special_operations.indexOf(request_oper) !== -1) {
                            const request_cloned_net = request.clone();
                            try {
                                const response_net = await this._tryFromNetwork(
                                    request_cloned_net,
                                    request_oper
                                );
                                if (response_net) {
                                    return resolve(response_net);
                                }
                            } catch (err) {
                                // Do nothing
                            }
                        }
                    }

                    const request_cloned_cache = request.clone();
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

                    // If all fails fallback to network (excepts in offline mode)
                    if (options.is_offline) {
                        // Avoid default browser behaviour, response a generic valid value
                        return resolve(Tools.ResponseJSONRPC([]));
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
                    if (options.is_standalone_mode) {
                        this._managers.config.set("pwa_mode", "offline");
                        this.postBroadcastMessage({
                            type: "PWA_CONFIG_CHANGED",
                            changes: {pwa_mode: "offline"},
                        });
                        return resolve(new Response("", {headers: {Refresh: "0"}}));
                    }
                }

                // Fallback
                try {
                    const fetch_res = await fetch(request);
                    return resolve(fetch_res);
                } catch (err) {
                    return resolve(false);
                }
            });
        },

        processRequestInternal: function(request, url) {
            if (
                request.method !== "POST" ||
                !request.headers
                    .get("Content-Type")
                    .toLowerCase()
                    .includes("application/json")
            ) {
                return Promise.resolve(false);
            }

            return new Promise(async resolve => {
                const request_cloned_cache = request.clone();
                try {
                    const request_data = await request_cloned_cache.json();
                    // Check 'internal' routes
                    const route_internal_entries = Object.entries(
                        this._routes.post.internal
                    );
                    for (const [key, fnct] of route_internal_entries) {
                        if (url.pathname.startsWith(key)) {
                            const result = await this[fnct](url, request_data);
                            return resolve(result);
                        }
                    }
                } catch (err) {
                    console.log(
                        "[ServiceWorker] The configuration requests can be processed..."
                    );
                    console.log(err);
                    // This should allways return a valid response, its an internal route.
                    return resolve(Tools.ResponseJSONRPC({}));
                }
                return resolve(false);
            });
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
            if (!this.isActivated(false)) {
                return fetch(request);
            }
            return new Promise(async (resolve, reject) => {
                const options = {
                    is_standalone_mode:
                        (this._managers.config &&
                            this._managers.config.isStandaloneMode()) ||
                        false,
                    is_offline:
                        (this._managers.config &&
                            this._managers.config.isOfflineMode()) ||
                        false,
                };
                const url = new URL(request.url);
                // Console.log("------ STANDALONE: ", options.is_standalone_mode);
                // console.log("------ MODE OFF: ", options.is_offline);
                // console.log("------ METHOD: ", request.method);
                // console.log("------ CONTENT TYPE: ", request.headers.get("Content-Type"));
                try {
                    const resInternal = await this.processRequestInternal(request, url);
                    if (resInternal !== false) {
                        return resolve(resInternal);
                    }

                    if (!this.isActivated()) {
                        const fetch_res = await fetch(request);
                        return resolve(fetch_res);
                    }
                    const [resGET, resPOST] = await Promise.all([
                        this.processRequestGET(request, url, options),
                        this.processRequestPOST(request, url, options),
                    ]);
                    if (resGET !== false) {
                        return resolve(resGET);
                    } else if (resPOST !== false) {
                        return resolve(resPOST);
                    }
                    // No cached request
                    const fetch_res = await fetch(request);
                    return resolve(fetch_res);
                } catch (err) {
                    return reject(err);
                }
            });
        },

        /**
         * @param {Request} request
         * @param {Exception} err
         */
        _onCacheNotFound: function() {
            // To be overriden
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
         * @param {String} request_oper
         * @returns {Promise}
         */
        _tryFromNetwork: function(request, request_oper) {
            return new Promise(async (resolve, reject) => {
                try {
                    const request_cloned = request.clone();
                    const response_net = await fetch(request);
                    if (response_net) {
                        // Handle special operations
                        if (this._special_operations.indexOf(request_oper) === -1) {
                            const request_data = await request_cloned.json();
                            await this._processResponse(response_net, request_data);
                        } else {
                            // CUD operation trigger prefetch model data to ensure have
                            // up to date values
                            await this._components.prefetch.prefetchModelData();
                            this._db.persistDatabases();
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
         * @param {Object} request_cloned_cache
         * @returns {Promise}
         */
        _tryPostFromCache: function(request_cloned_cache) {
            return new Promise(async (resolve, reject) => {
                try {
                    const request_data = await request_cloned_cache.json();
                    const url = new URL(request_cloned_cache.url);
                    // Check 'out' routes
                    const route_out_entries = Object.entries(this._routes.post.out);
                    for (const [key, fnct] of route_out_entries) {
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
         * @param {Object} request_cloned_cache
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
            if (this._prefetch_running) {
                // Avoid if prefetching is running
                return Promise.resolve();
            }
            console.log("[ServiceWorker] Processing Response...");
            if (!response) {
                return Promise.reject();
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
