/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA", function (require) {
    "use strict";

    const PWA = require("web_pwa_oca.PWA");
    const OdooRPC = require("web_pwa_cache.PWA.core.base.RPC");
    const DatabaseManager = require("web_pwa_cache.PWA.core.DatabaseManager");
    const CacheManager = require("web_pwa_cache.PWA.core.CacheManager");
    const OdooDatabase = require("web_pwa_cache.PWA.core.OdooDatabase");
    const Config = require("web_pwa_cache.PWA.core.Config");
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

            this._dbmanager = new DatabaseManager();
            this._rpc = new OdooRPC();
            this._cachemanager = new CacheManager();

            this._whenLoaded();
        },

        _whenLoaded: function () {
            if (!this._loadPromise) {
                this._isLoaded = false;
                this._loadPromise = new Promise(async resolve => {
                    await this._cachemanager.cleanAll();
                    await this._cachemanager.initCache(this._cache_name);
                    this._db = await this._dbmanager.initDatabase(this._onStartWebClientDB.bind(this));
                    this._odoodb = new OdooDatabase(this);
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
            return fetch(request); // FIXME: Bypass cache implementation
            if (_.isEmpty(this._components)) {
                // PWA Not Actually Loaded
                console.warn("[ServiceWorker] The components are not currently loaded... Fallback to default browser behaviour.");
                return fetch(request);
            }
            if (request.method === 'GET') {
                return new Promise(async (resolve, reject) => {
                    try {
                        const isOffline = await this.config.isOfflineMode();
                        const isStandalone = await this.config.isStandaloneMode();
                        // need redirect '/'?
                        const url = new URL(request.url);
                        if (url.pathname === '/' && (isOffline || isStandalone)) {
                            return resolve(ResponseRedirect('/web'));
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
                        const isStandalone = await this.config.isStandaloneMode();
                        console.log("IS STANDALONE:", isStandalone);
                        if (isStandalone) {
                            const isOffline = await this.config.isOfflineMode();
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
         * Creates the schema of the used database:
         *  - views: Store views
         *  - actions: Store actions
         *  - sync: Store transactions to synchronize
         *  - config: Store PWA configurations values
         *  - functions: Store function calls results
         *  - post: Store post calls results
         *  - userdata: Store user data configuration values
         *  - onchange: Store onchange values
         *  - template: Store templates
         *  - model: Store model information
         *  - name_search: Store records to improve
         *                search performance
         *  - binary: Store records to improve
         *                search performance
         *
         * @private
         * @param {IDBDatabaseEvent} evt
         */
        _onStartWebClientDB: function (db) {
            return new Promise(async (resolve, reject) => {
                console.log("[ServiceWorker] Generating DB Schema...");
                try {
                    const model_info_model_metadata = {
                        table: this._dbmanager.getInternalTableName('model_metadata'),
                        model: this._dbmanager.getInternalTableName('model_metadata'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            name: {type: 'char', store: true},
                            internal: {type: 'boolean', store: true},
                            orderby: {type: 'char', store: true},
                            rec_name: {type: 'char', store: true},
                            fields: {type: 'json', store: true},
                            view_types: {type: 'json', store: true},
                            parent_store: {type: 'char', store: true},
                            parent_name: {type: 'char', store: true},
                            inherits: {type: 'json', store: true},
                            table: {type: 'char', store: true},
                            prefetch_last_update: {type: 'datetime', store: true},
                            defaults: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_model_metadata);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS model_metadata_model ON ${this._dbmanager.getInternalTableName('model_metadata')} (model)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_model_metadata, ["model"]);

                    const model_info_views = {
                        table: this._dbmanager.getInternalTableName('views'),
                        model: this._dbmanager.getInternalTableName('views'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            name: {type: 'char', store: true},
                            type: {type: 'char', store: true},
                            model: {type: 'char', store: true},
                            fields: {type: 'json', store: true},
                            base_model: {type: 'char', store: true},
                            field_parent: {type: 'char', store: true},
                            toolbar: {type: 'char', store: true},
                            arch: {type: 'char', store: true},
                            view_id: {type: 'many2one', store: true},
                            standalone: {type: 'boolean', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_views);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS views_model_view_id_type ON ${this._dbmanager.getInternalTableName('views')} (model, view_id, type)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_views, ["model"]);

                    const model_info_actions = {
                        table: this._dbmanager.getInternalTableName('actions'),
                        model: this._dbmanager.getInternalTableName('actions'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            flags: {type: 'json', store: true},
                            display_name: {type: 'char', store: true},
                            create_date: {type: 'datetime', store: true},
                            view_ids: {type: 'one2many', store: true},
                            write_uid: {type: 'many2one', store: true},
                            name: {type: 'char', store: true},
                            type: {type: 'selection', store: true},
                            res_model: {type: 'char', store: true},
                            search_view: {type: 'text', store: true},
                            create_uid: {type: 'many2one', store: true},
                            filter: {type: 'char', store: true},
                            target: {type: 'selection', store: true},
                            groups_id: {type: 'many2many', store: true},
                            limit: {type: 'integer', store: true},
                            view_mode: {type: 'selection', store: true},
                            views: {type: 'json', store: true},
                            context: {type: 'json', store: true},
                            auto_search: {type: 'boolean', store: true},
                            help: {type: 'html', store: true},
                            search_view_id: {type: 'many2one', store: true},
                            res_id: {type: 'integer', store: true},
                            write_date: {type: 'datetime', store: true},
                            domain: {type: 'char', store: true},
                            src_model: {type: 'char', store: true},
                            view_id: {type: 'many2one', store: true},
                            binding_type: {type: 'selection', store: true},
                            xml_id: {type: 'char', store: true},
                            usage: {type: 'selection', store: true},
                            binding_model_id: {type: 'many2one', store: true},
                            multi: {type: 'boolean', store: true},
                            link_field_id: {type: 'many2one', store: true},
                            crud_model_id: {type: 'many2one', store: true},
                            activity_user_id: {type: 'many2one', store: true},
                            activity_date_deadline_range: {type: 'integer', store: true},
                            child_ids: {type: 'one2many', store: true},
                            model_id: {type: 'many2one', store: true},
                            activity_note: {type: 'html', store: true},
                            crud_model_name: {type: 'char', store: true},
                            state: {type: 'selection', store: true},
                            code: {type: 'char', store: true},
                            activity_type_id: {type: 'many2one', store: true},
                            fields_lines: {type: 'one2many', store: true},
                            partner_ids: {type: 'many2many', store: true},
                            website_path: {type: 'char', store: true},
                            channel_ids: {type: 'one2many', store: true},
                            activity_user_field_name: {type: 'char', store: true},
                            activity_user_type: {type: 'selection', store: true},
                            sequence: {type: 'integer', store: true},
                            activity_summary: {type: 'char', store: true},
                            website_published: {type: 'boolean', store: true},
                            website_url: {type: 'char', store: true},
                            template_id: {type: 'many2one', store: true},
                            activity_date_deadline_range_type: {type: 'selection', store: true},
                            model_name: {type: 'char', store: true},
                            params_store: {type: 'json'},
                            tag: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            __last_update: {type: 'datetime', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_actions);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_actions, ["model"]);

                    const model_info_sync = {
                        table: this._dbmanager.getInternalTableName('sync'),
                        model: this._dbmanager.getInternalTableName('sync'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            args: {type: 'json', store: true},
                            date: {type: 'datetime', store: true},
                            linked: {type: 'json', store: true},
                            kwargs: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_sync);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_sync, ["model"]);

                    const model_info_config = {
                        table: this._dbmanager.getInternalTableName('config'),
                        model: this._dbmanager.getInternalTableName('config'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            param: {type: 'char', store: true},
                            value: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_config);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS config_param ON ${this._dbmanager.getInternalTableName('config')} (param)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_config, ["model"]);

                    const model_info_function = {
                        table: this._dbmanager.getInternalTableName('function'),
                        model: this._dbmanager.getInternalTableName('function'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            method: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            result: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_function);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS function_model_method_params ON ${this._dbmanager.getInternalTableName('function')} (model, method, params)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_function, ["model"]);

                    const model_info_post = {
                        table: this._dbmanager.getInternalTableName('post'),
                        model: this._dbmanager.getInternalTableName('post'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            pathname: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            result: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_post);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS post_pathname_params ON ${this._dbmanager.getInternalTableName('post')} (pathname, params)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_post, ["model"]);

                    const model_info_userdata = {
                        table: this._dbmanager.getInternalTableName('userdata'),
                        model: this._dbmanager.getInternalTableName('userdata'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            param: {type: 'char', store: true},
                            value: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_userdata);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS userdata_param ON ${this._dbmanager.getInternalTableName('userdata')} (param)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_userdata, ["model"]);

                    const model_info_onchange = {
                        table: this._dbmanager.getInternalTableName('onchange'),
                        model: this._dbmanager.getInternalTableName('onchange'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            field: {type: 'char', store: true},
                            params: {type: 'json', store: true},
                            changes: {type: 'json', store: true},
                            formula: {type: 'text', store: true},
                            triggers: {type: 'char', store: true},
                            field_value: {type: 'json', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_onchange);
                    await db.query([`CREATE INDEX IF NOT EXISTS onchange_model_field_field_value ON ${this._dbmanager.getInternalTableName('onchange')} (model, field, field_value)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_onchange, ["model"]);

                    const model_info_template = {
                        table: this._dbmanager.getInternalTableName('template'),
                        model: this._dbmanager.getInternalTableName('template'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            xml_ref: {type: 'char', store: true},
                            template: {type: 'text', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_template);
                    await db.query([`CREATE UNIQUE INDEX IF NOT EXISTS template_xml_ref ON ${this._dbmanager.getInternalTableName('template')} (xml_ref)`]);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_template, ["model"]);

                    const model_info_defaults = {
                        table: this._dbmanager.getInternalTableName('defaults'),
                        model: this._dbmanager.getInternalTableName('defaults'),
                        internal: true,
                        fields: {
                            id: {type: 'integer', store: true},
                            model: {type: 'char', store: true},
                            formula: {type: 'text', store: true},
                        }
                    };
                    await this._dbmanager.createTable(model_info_defaults);
                    await this._dbmanager.createOrUpdateRecord(model_info_model_metadata, model_info_defaults, ["model"]);

                    // db.createObjectStore("binary", {
                    //     keyPath: ["model", "id"],
                    //     unique: true,
                    // });
                } catch (err) {
                    return reject(err);
                }

                return resolve();
            });
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
